import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LAST_SEQUENCE_KEY,
  appendPendingEvents,
  readActivePresentation,
  readPendingEvents,
} from './presentationStorage'
import type { MergeEvent, MergeRaceState } from './types'
import { useMergeRaceOrchestrator } from './useMergeRaceOrchestrator'

const mergeEvent: MergeEvent = {
  baseRefName: 'main',
  commitCount: 4,
  id: '8th-COKERTHON/client-team3#12',
  mergedAt: '2026-07-11T00:00:00.000Z',
  prNumber: 12,
  repository: '8th-COKERTHON/client-team3',
  repositoryType: 'client',
  sequence: 1,
  teamId: 3,
  teamName: '3팀',
  url: 'https://github.com/example',
}

const state: MergeRaceState = {
  events: [mergeEvent],
  github: { connected: true, error: null, nextRetryAt: null, stale: false },
  instanceId: 'test',
  lastSuccessfulPollAt: '2026-07-11T00:00:00.000Z',
  latestSequence: 1,
  ok: true,
  serverTime: '2026-07-11T00:00:00.000Z',
  teams: Array.from({ length: 6 }, (_, index) => ({
    client: index === 2 ? 4 : 0,
    color: '#fff',
    name: `${index + 1}팀`,
    server: 0,
    teamId: index + 1,
    total: index === 2 ? 4 : 0,
  })),
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.sessionStorage.setItem(LAST_SEQUENCE_KEY, '0')
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => state,
  })))
})

describe('useMergeRaceOrchestrator', () => {
  it('opens Merge Race immediately when a merge arrives on the timer', async () => {
    const navigate = vi.fn()
    renderHook(() => useMergeRaceOrchestrator({
      navigate,
      path: '/features/hackathon-timer',
    }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/features/merge-race'))
    expect(readActivePresentation()?.batch.events).toHaveLength(1)
    expect(readPendingEvents()).toEqual([])
  })

  it('keeps the roulette visible and queues the merge for later', async () => {
    const navigate = vi.fn()
    renderHook(() => useMergeRaceOrchestrator({
      navigate,
      path: '/features/lucky-potato-draw',
    }))

    await waitFor(() => expect(readPendingEvents()).toHaveLength(1))
    expect(navigate).not.toHaveBeenCalled()
    expect(readActivePresentation()).toBeNull()
  })

  it('leaves a merge on the live race screen for the feature to announce in place', async () => {
    const navigate = vi.fn()
    renderHook(() => useMergeRaceOrchestrator({
      navigate,
      path: '/features/merge-race',
    }))

    await waitFor(() => expect(window.sessionStorage.getItem(LAST_SEQUENCE_KEY)).toBe('1'))
    expect(navigate).not.toHaveBeenCalled()
    expect(readPendingEvents()).toEqual([])
    expect(readActivePresentation()).toBeNull()
  })

  it('recovers a persisted roulette queue when the browser returns to the timer', async () => {
    const navigate = vi.fn()
    window.sessionStorage.setItem(LAST_SEQUENCE_KEY, '1')
    appendPendingEvents([mergeEvent])

    renderHook(() => useMergeRaceOrchestrator({
      navigate,
      path: '/features/hackathon-timer',
    }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/features/merge-race'))
    expect(readActivePresentation()?.batch.totalMerges).toBe(1)
  })
})
