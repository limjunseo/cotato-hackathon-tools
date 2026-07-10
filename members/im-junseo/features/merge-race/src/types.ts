export type RepositoryType = 'client' | 'server'

export type MergeEvent = {
  baseRefName: string
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

export type TeamChange = {
  count: number
  teamId: number
  teamName: string
}

export type MergeBatch = {
  createdAt: string
  events: MergeEvent[]
  id: string
  teamChanges: TeamChange[]
  totalMerges: number
}

export type MergePresentation = {
  batch: MergeBatch
  durationMs: number
  mode: 'auto'
  presentationId: string
  returnPath: string
  scoresAfter: TeamScore[]
  scoresBefore: TeamScore[]
  startedAt: number
}

export type MergeRaceState = {
  events: MergeEvent[]
  github: {
    connected: boolean
    error: string | null
    nextRetryAt: string | null
    stale: boolean
  }
  instanceId: string
  lastSuccessfulPollAt: string | null
  latestSequence: number
  ok: true
  serverTime: string
  teams: TeamScore[]
}

export type PresentationPhase = 'detected' | 'announcement' | 'race' | 'standings' | 'exit' | 'manual'
