import { randomUUID } from 'node:crypto'
import { prepareBootstrap } from './bootstrap'
import { GitHubClientError, GitHubMergeClient } from './github-client'
import { calculateScores, createEmptyScores, selectValidMerges } from './score-engine'
import { loadRuntimeState, saveRuntimeState } from './merge-store'
import {
  MERGE_LOOKBACK_MS,
  MERGE_POLL_INTERVAL_MS,
  MERGE_RACE_START_AT,
} from './team-config'
import type {
  MergeEvent,
  MergeRaceServerState,
  RuntimeState,
  TeamScore,
} from './types'

const MAX_RECENT_EVENTS = 200
const FAILURE_BACKOFF_MS = [10_000, 20_000, 40_000, 60_000]

type MergePollerOptions = {
  runtimeStateFile: string
  token: string | undefined
}

export class MergePoller {
  private readonly instanceId = randomUUID()
  private readonly runtimeStateFile: string
  private readonly token: string | undefined
  private client: GitHubMergeClient | null = null
  private defaultBranches = new Map<string, string>()
  private failureCount = 0
  private initializedAt = new Date().toISOString()
  private lastSuccessfulPollAt: string | null = null
  private latestSequence = 0
  private mergeById = new Map<string, Omit<MergeEvent, 'sequence'>>()
  private nextRetryAt: string | null = null
  private pollInFlight: Promise<void> | null = null
  private recentEvents: MergeEvent[] = []
  private seenMergeKeys = new Set<string>()
  private scores: TeamScore[] = createEmptyScores()
  private syncError: string | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(options: MergePollerOptions) {
    this.runtimeStateFile = options.runtimeStateFile
    this.token = options.token
  }

  async start() {
    if (!this.token) {
      this.syncError = 'GITHUB_TOKEN is not configured.'
      return
    }

    this.client = new GitHubMergeClient(this.token)
    await this.runPoll(true)
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  getState(): MergeRaceServerState {
    const now = Date.now()
    const lastSuccess = this.lastSuccessfulPollAt ? Date.parse(this.lastSuccessfulPollAt) : 0

    return {
      events: this.recentEvents,
      github: {
        connected: this.client !== null && this.syncError === null,
        error: this.syncError,
        nextRetryAt: this.nextRetryAt,
        rateLimit: this.client?.lastRateLimit ?? null,
        stale: lastSuccess === 0 || now - lastSuccess > 15_000,
      },
      instanceId: this.instanceId,
      lastSuccessfulPollAt: this.lastSuccessfulPollAt,
      latestSequence: this.latestSequence,
      ok: true,
      serverTime: new Date(now).toISOString(),
      teams: this.scores,
    }
  }

  private scheduleNext(delayMs: number, retry = false) {
    this.nextRetryAt = retry ? new Date(Date.now() + delayMs).toISOString() : null
    this.timer = setTimeout(() => void this.runPoll(false), delayMs)
  }

  private async runPoll(bootstrap: boolean) {
    if (this.pollInFlight) {
      return this.pollInFlight
    }

    this.pollInFlight = this.performPoll(bootstrap)
      .finally(() => {
        this.pollInFlight = null
      })
    return this.pollInFlight
  }

  private async performPoll(bootstrap: boolean) {
    if (!this.client) {
      return
    }

    try {
      if (bootstrap) {
        await this.bootstrap()
      } else {
        await this.pollLatest()
      }

      this.failureCount = 0
      this.syncError = null
      this.nextRetryAt = null
      this.scheduleNext(MERGE_POLL_INTERVAL_MS)
    } catch (error) {
      this.failureCount += 1
      this.syncError = error instanceof Error ? error.message : 'Unknown GitHub polling error.'
      const fallbackDelay = FAILURE_BACKOFF_MS[Math.min(this.failureCount - 1, FAILURE_BACKOFF_MS.length - 1)]
      const retryAt = error instanceof GitHubClientError ? error.retryAt : null
      const retryDelay = retryAt
        ? Math.max(fallbackDelay, Date.parse(retryAt) - Date.now())
        : fallbackDelay
      const scheduledDelay = retryAt
        ? Math.max(1_000, retryDelay)
        : Math.min(60_000, Math.max(1_000, retryDelay))
      this.scheduleNext(scheduledDelay, true)
    }
  }

  private async bootstrap() {
    if (!this.client) {
      return
    }

    const runtimeState = await loadRuntimeState(this.runtimeStateFile)
    this.defaultBranches = await this.client.fetchRepositoryDefaults()
    const pullRequests = await this.client.fetchMergedPullRequests(MERGE_RACE_START_AT)
    const allValidMerges = selectValidMerges(pullRequests, this.defaultBranches)

    this.mergeById = new Map(allValidMerges.map((merge) => [merge.id, merge]))
    this.scores = calculateScores(allValidMerges)
    const bootstrapState = prepareBootstrap(allValidMerges, runtimeState)
    this.latestSequence = bootstrapState.latestSequence
    this.initializedAt = runtimeState?.initializedAt ?? new Date().toISOString()
    this.appendEvents(bootstrapState.notificationMerges)
    this.seenMergeKeys = bootstrapState.seenMergeKeys
    this.lastSuccessfulPollAt = new Date().toISOString()
    await this.persistRuntimeState()
  }

  private async pollLatest() {
    if (!this.client) {
      return
    }

    const pollFrom = Math.max(
      Date.parse(MERGE_RACE_START_AT),
      (this.lastSuccessfulPollAt ? Date.parse(this.lastSuccessfulPollAt) : Date.now()) - MERGE_LOOKBACK_MS,
    )
    const pullRequests = await this.client.fetchMergedPullRequests(new Date(pollFrom).toISOString())
    const newMerges = selectValidMerges(
      pullRequests,
      this.defaultBranches,
      this.seenMergeKeys,
    )

    newMerges.forEach((merge) => {
      this.mergeById.set(merge.id, merge)
      this.seenMergeKeys.add(merge.id)
    })
    this.appendEvents(newMerges)
    this.scores = calculateScores([...this.mergeById.values()])
    this.lastSuccessfulPollAt = new Date().toISOString()
    await this.persistRuntimeState()
  }

  private appendEvents(merges: Array<Omit<MergeEvent, 'sequence'>>) {
    const events = merges.map((merge) => ({
      ...merge,
      sequence: ++this.latestSequence,
    }))
    this.recentEvents = [...this.recentEvents, ...events].slice(-MAX_RECENT_EVENTS)
  }

  private persistRuntimeState() {
    const state: RuntimeState = {
      initializedAt: this.initializedAt,
      lastSuccessfulPollAt: this.lastSuccessfulPollAt,
      latestSequence: this.latestSequence,
      schemaVersion: 1,
      seenMergeKeys: [...this.seenMergeKeys],
    }
    return saveRuntimeState(this.runtimeStateFile, state)
  }
}
