import type {
  MergeBatch,
  MergeEvent,
  MergePresentation,
  MergeRaceState,
  TeamChange,
} from './types'

export const ACTIVE_PRESENTATION_KEY = 'cotato.mergeRace.activePresentation'
export const LATEST_STATE_KEY = 'cotato.mergeRace.latestState'
export const LAST_SEQUENCE_KEY = 'cotato.mergeRace.lastSequence'
export const PENDING_EVENTS_KEY = 'cotato.mergeRace.pendingEvents'
export const PRESENTATION_EVENT = 'cotato:merge-race-presentation'
export const PRESENTATION_DURATION_MS = 15_000

function read<T>(key: string, fallback: T): T {
  try {
    const value = window.sessionStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export function readLastSequence() {
  return Number(window.sessionStorage.getItem(LAST_SEQUENCE_KEY) ?? '0')
}

export function writeLastSequence(sequence: number) {
  window.sessionStorage.setItem(LAST_SEQUENCE_KEY, String(sequence))
}

export function readPendingEvents() {
  return read<MergeEvent[]>(PENDING_EVENTS_KEY, [])
}

export function appendPendingEvents(events: MergeEvent[]) {
  const pending = readPendingEvents()
  const eventById = new Map([...pending, ...events].map((event) => [event.id, event]))
  const next = [...eventById.values()].sort((first, second) => first.sequence - second.sequence)
  write(PENDING_EVENTS_KEY, next)
  return next
}

export function drainPendingEvents() {
  const pending = readPendingEvents()
  write(PENDING_EVENTS_KEY, [])
  return pending
}

export function readActivePresentation() {
  return read<MergePresentation | null>(ACTIVE_PRESENTATION_KEY, null)
}

export function clearActivePresentation() {
  window.sessionStorage.removeItem(ACTIVE_PRESENTATION_KEY)
  window.dispatchEvent(new Event(PRESENTATION_EVENT))
}

export function writeLatestState(state: MergeRaceState) {
  write(LATEST_STATE_KEY, state)
}

function createBatch(events: MergeEvent[]): MergeBatch {
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
    id: crypto.randomUUID(),
    teamChanges: [...changes.values()].sort((first, second) => first.teamId - second.teamId),
    totalCommits: events.reduce((total, event) => total + event.commitCount, 0),
    totalMerges: events.length,
  }
}

export function createPresentation(
  events: MergeEvent[],
  state: MergeRaceState,
  returnPath: string,
): MergePresentation {
  const clientChanges = new Map<number, number>()
  const serverChanges = new Map<number, number>()
  events.forEach((event) => {
    const changes = event.repositoryType === 'client' ? clientChanges : serverChanges
    changes.set(event.teamId, (changes.get(event.teamId) ?? 0) + event.commitCount)
  })

  return {
    batch: createBatch(events),
    durationMs: PRESENTATION_DURATION_MS,
    mode: 'auto',
    presentationId: crypto.randomUUID(),
    returnPath,
    scoresAfter: state.teams,
    scoresBefore: state.teams.map((team) => {
      const client = clientChanges.get(team.teamId) ?? 0
      const server = serverChanges.get(team.teamId) ?? 0
      return {
        ...team,
        client: Math.max(0, team.client - client),
        server: Math.max(0, team.server - server),
        total: Math.max(0, team.total - client - server),
      }
    }),
    startedAt: Date.now(),
  }
}

export function writeActivePresentation(presentation: MergePresentation) {
  write(ACTIVE_PRESENTATION_KEY, presentation)
  window.dispatchEvent(new Event(PRESENTATION_EVENT))
}
