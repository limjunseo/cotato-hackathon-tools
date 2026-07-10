import type {
  MergeBatch,
  MergeEvent,
  MergePresentation,
  PresentationPhase,
  TeamChange,
  TeamScore,
} from '../types'

export const ACTIVE_PRESENTATION_KEY = 'cotato.mergeRace.activePresentation'
export const LATEST_STATE_KEY = 'cotato.mergeRace.latestState'
export const PRESENTATION_EVENT = 'cotato:merge-race-presentation'

export function createBatch(events: MergeEvent[], id: string = crypto.randomUUID()): MergeBatch {
  const changes = new Map<number, TeamChange>()
  events.forEach((event) => {
    const current = changes.get(event.teamId)
    changes.set(event.teamId, {
      commitCount: (current?.commitCount ?? 0) + event.commitCount,
      mergeCount: (current?.mergeCount ?? 0) + 1,
      teamId: event.teamId,
      teamName: event.teamName,
    })
  })

  return {
    createdAt: new Date().toISOString(),
    events,
    id,
    teamChanges: [...changes.values()].sort((first, second) => first.teamId - second.teamId),
    totalCommits: events.reduce((total, event) => total + event.commitCount, 0),
    totalMerges: events.length,
  }
}

export function readSessionValue<T>(key: string): T | null {
  try {
    const value = window.sessionStorage.getItem(key)
    return value ? JSON.parse(value) as T : null
  } catch {
    return null
  }
}

export function getPresentationPhase(elapsedMs: number, automatic: boolean): PresentationPhase {
  if (!automatic) return 'manual'
  if (elapsedMs < 1_500) return 'detected'
  if (elapsedMs < 4_800) return 'announcement'
  if (elapsedMs < 11_200) return 'race'
  if (elapsedMs < 15_200) return 'standings'
  return 'exit'
}

export function buildAnnouncement(batch: MergeBatch) {
  if (batch.teamChanges.length === 1) {
    const change = batch.teamChanges[0]
    return change.mergeCount === 1
      ? `${change.teamName}이 MERGE했습니다!`
      : `${change.teamName}이 ${change.mergeCount}건 MERGE했습니다!`
  }

  const names = batch.teamChanges.map((change) => change.teamName).join(', ')
  return `${names}에서 총 ${batch.totalMerges}건 MERGE!`
}

export function getTeamChange(batch: MergeBatch | null, teamId: number) {
  return batch?.teamChanges.find((change) => change.teamId === teamId)?.commitCount ?? 0
}

export function getRaceProgress(score: number) {
  if (score <= 0) return 0
  return (score / (score + 5)) * 72
}

export function getRankedTeams(teams: TeamScore[]) {
  const sorted = [...teams].sort((first, second) => (
    second.total - first.total || first.teamId - second.teamId
  ))
  let previousScore: number | null = null
  let previousRank = 0

  return sorted.map((team, index) => {
    const rank = team.total === previousScore ? previousRank : index + 1
    previousScore = team.total
    previousRank = rank
    return { rank, team }
  })
}

export function subtractBatchFromScores(teams: TeamScore[], teamChanges: TeamChange[]) {
  const changes = new Map(teamChanges.map((change) => [change.teamId, change.commitCount]))
  return teams.map((team) => {
    const count = changes.get(team.teamId) ?? 0
    return { ...team, total: Math.max(0, team.total - count) }
  })
}

export function isActivePresentation(value: MergePresentation | null, now = Date.now()) {
  return Boolean(value && value.startedAt + value.durationMs > now)
}
