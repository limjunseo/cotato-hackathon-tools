export type RepositoryType = 'client' | 'server'

export type TeamConfig = {
  id: number
  name: string
  color: string
  repositories: Record<RepositoryType, string>
}

export type RawMergedPullRequest = {
  baseRefName: string
  mergedAt: string | null
  number: number
  repositoryFullName: string
  url: string
}

export type RepositorySnapshot = {
  commitCount: number
  defaultBranch: string
}

export type MergeEvent = {
  baseRefName: string
  commitCount: number
  id: string
  mergedAt: string
  prNumber: number
  repository: string
  repositoryType: RepositoryType
  sequence: number
  teamId: number
  teamName: string
  url: string
}

export type TeamScore = {
  client: number
  color: string
  name: string
  server: number
  teamId: number
  total: number
}

export type RateLimitState = {
  cost: number
  remaining: number
  resetAt: string
}

export type GitHubSyncState = {
  connected: boolean
  error: string | null
  nextRetryAt: string | null
  rateLimit: RateLimitState | null
  stale: boolean
}

export type MergeRaceServerState = {
  events: MergeEvent[]
  github: GitHubSyncState
  instanceId: string
  lastSuccessfulPollAt: string | null
  latestSequence: number
  ok: true
  serverTime: string
  teams: TeamScore[]
}

export type RuntimeState = {
  initializedAt: string
  lastSuccessfulPollAt: string | null
  latestSequence: number
  schemaVersion: 1
  seenMergeKeys: string[]
}
