import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { EMPTY_TEAMS } from './data/teams'
import { ACTIVE_PRESENTATION_KEY } from './lib/presentation'
import type { MergePresentation, MergeRaceState } from './types'

const audioMocks = vi.hoisted(() => ({
  playMergeNotificationAudio: vi.fn(() => null),
  playPresentationAudio: vi.fn(() => null),
}))

vi.mock('./lib/audio', () => audioMocks)

const state: MergeRaceState = {
  events: [],
  github: { connected: true, error: null, nextRetryAt: null, stale: false },
  instanceId: 'test-server',
  lastSuccessfulPollAt: '2026-07-11T00:00:00.000Z',
  latestSequence: 0,
  ok: true,
  serverTime: '2026-07-11T00:00:00.000Z',
  teams: EMPTY_TEAMS,
}

beforeEach(() => {
  window.sessionStorage.clear()
  audioMocks.playMergeNotificationAudio.mockClear()
  audioMocks.playPresentationAudio.mockClear()
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => state,
  })))
})

describe('Commit Race', () => {
  it('shows all six lanes and manual live mode when opened directly', () => {
    render(<App />)

    expect(screen.getByText('MANUAL LIVE MODE')).toBeInTheDocument()
    expect(screen.getByText('COMMIT RACE')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '6개 팀 Commit Race' })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/팀 감자$/)).toHaveLength(6)
  })

  it('announces a new merge with sound without leaving the live race screen', async () => {
    const mergedState: MergeRaceState = {
      ...state,
      events: [{
        baseRefName: 'main',
        commitCount: 2,
        id: '8th-COKERTHON/client-team1-#21',
        mergedAt: '2026-07-11T01:00:00.000Z',
        prNumber: 21,
        repository: '8th-COKERTHON/client-team1-',
        repositoryType: 'client',
        sequence: 1,
        teamId: 1,
        teamName: '1팀',
        url: 'https://github.com/example',
      }],
      latestSequence: 1,
      teams: EMPTY_TEAMS.map((team) => (
        team.teamId === 1 ? { ...team, client: 2, total: 2 } : team
      )),
    }
    let requestCount = 0
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => requestCount++ === 0 ? state : mergedState,
    })))

    const { container } = render(<App />)

    await waitFor(
      () => expect(audioMocks.playMergeNotificationAudio).toHaveBeenCalledTimes(1),
      { timeout: 2_500 },
    )
    expect(screen.getByText('1팀이 MERGE했습니다!')).toBeInTheDocument()
    expect(screen.getByText('1팀 +2 COMMITS')).toBeInTheDocument()
    expect(container.querySelector('.merge-announcement--live')).toBeInTheDocument()
    expect(window.location.pathname).not.toBe('/features/hackathon-timer')
  })

  it('restores an active presentation and shows its grouped announcement', () => {
    const presentation: MergePresentation = {
      batch: {
        createdAt: new Date().toISOString(),
        events: [],
        id: 'batch-4',
        teamChanges: [
          { commitCount: 3, mergeCount: 1, teamId: 2, teamName: '2팀' },
          { commitCount: 8, mergeCount: 2, teamId: 5, teamName: '5팀' },
        ],
        totalCommits: 11,
        totalMerges: 3,
      },
      durationMs: 15_000,
      mode: 'auto',
      presentationId: 'presentation-4',
      returnPath: '/features/hackathon-timer',
      scoresBefore: EMPTY_TEAMS,
      scoresAfter: EMPTY_TEAMS.map((team) => (
        team.teamId === 2 ? { ...team, total: 3 } : team.teamId === 5 ? { ...team, total: 8 } : team
      )),
      startedAt: Date.now() - 2_000,
    }
    window.sessionStorage.setItem(ACTIVE_PRESENTATION_KEY, JSON.stringify(presentation))

    render(<App />)

    expect(screen.getByText('2팀, 5팀에서 총 3건 MERGE!')).toBeInTheDocument()
    expect(screen.getByText('2팀 +3 COMMITS · 5팀 +8 COMMITS')).toBeInTheDocument()
  })

  it('shows a large centered standings board before returning to the timer', () => {
    const presentation: MergePresentation = {
      batch: {
        createdAt: new Date().toISOString(),
        events: [],
        id: 'batch-final',
        teamChanges: [{ commitCount: 4, mergeCount: 1, teamId: 3, teamName: '3팀' }],
        totalCommits: 4,
        totalMerges: 1,
      },
      durationMs: 15_000,
      mode: 'auto',
      presentationId: 'presentation-final',
      returnPath: '/features/hackathon-timer',
      scoresBefore: EMPTY_TEAMS,
      scoresAfter: EMPTY_TEAMS.map((team) => team.teamId === 3 ? { ...team, total: 4 } : team),
      startedAt: Date.now() - 11_000,
    }
    window.sessionStorage.setItem(ACTIVE_PRESENTATION_KEY, JSON.stringify(presentation))

    const { container } = render(<App />)

    expect(container.querySelector('.final-standings')).toBeInTheDocument()
    expect(screen.getByText('깃허브 커밋 횟수 기준')).toBeInTheDocument()
    expect(container.querySelector('.final-standings li strong')?.textContent).toBe('3팀')
  })
})
