import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  appendPendingEvents,
  createPresentation,
  drainPendingEvents,
  readActivePresentation,
  writeActivePresentation,
} from './presentationStorage'
import type { MergeEvent, MergeRaceState } from './types'

function event(teamId: number, sequence: number, repositoryType: 'client' | 'server' = 'client'): MergeEvent {
  return {
    baseRefName: 'main',
    id: `repo-${teamId}#${sequence}`,
    mergedAt: '2026-07-11T00:00:00.000Z',
    prNumber: sequence,
    repository: `8th-COKERTHON/${repositoryType}-team${teamId}`,
    repositoryType,
    sequence,
    teamId,
    teamName: `${teamId}팀`,
    url: 'https://github.com/example',
  }
}

const state: MergeRaceState = {
  events: [],
  github: { connected: true, error: null, nextRetryAt: null, stale: false },
  instanceId: 'test',
  lastSuccessfulPollAt: '2026-07-11T00:00:00.000Z',
  latestSequence: 3,
  ok: true,
  serverTime: '2026-07-11T00:00:00.000Z',
  teams: Array.from({ length: 6 }, (_, index) => ({
    client: index === 1 ? 3 : 0,
    color: '#fff',
    name: `${index + 1}팀`,
    server: index === 1 ? 2 : 0,
    teamId: index + 1,
    total: index === 1 ? 5 : 0,
  })),
}

afterEach(() => window.sessionStorage.clear())

describe('merge race presentation storage', () => {
  it('deduplicates queued PRs and drains them as one catch-up batch', () => {
    appendPendingEvents([event(2, 1), event(2, 2)])
    appendPendingEvents([event(2, 2), event(5, 3)])

    expect(drainPendingEvents().map((item) => item.sequence)).toEqual([1, 2, 3])
    expect(drainPendingEvents()).toEqual([])
  })

  it('calculates scores before a client/server double merge and persists presentation timing', () => {
    vi.spyOn(Date, 'now').mockReturnValue(10_000)
    const presentation = createPresentation(
      [event(2, 1, 'client'), event(2, 2, 'server')],
      state,
      '/features/hackathon-timer',
    )
    writeActivePresentation(presentation)

    expect(presentation.batch.teamChanges).toEqual([{ count: 2, teamId: 2, teamName: '2팀' }])
    expect(presentation.scoresBefore[1]).toEqual(expect.objectContaining({ client: 2, server: 1, total: 3 }))
    expect(readActivePresentation()?.startedAt).toBe(10_000)
  })
})
