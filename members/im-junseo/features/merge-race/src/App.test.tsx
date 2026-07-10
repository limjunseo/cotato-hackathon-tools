import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { EMPTY_TEAMS } from './data/teams'
import { ACTIVE_PRESENTATION_KEY } from './lib/presentation'
import type { MergePresentation, MergeRaceState } from './types'

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
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => state,
  })))
})

describe('Merge Race', () => {
  it('shows all six lanes and manual live mode when opened directly', () => {
    render(<App />)

    expect(screen.getByText('MANUAL LIVE MODE')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '6개 팀 Merge Race' })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/팀 감자$/)).toHaveLength(6)
  })

  it('restores an active presentation and shows its grouped announcement', () => {
    const presentation: MergePresentation = {
      batch: {
        createdAt: new Date().toISOString(),
        events: [],
        id: 'batch-4',
        teamChanges: [
          { count: 1, teamId: 2, teamName: '2팀' },
          { count: 2, teamId: 5, teamName: '5팀' },
        ],
        totalMerges: 3,
      },
      durationMs: 15_000,
      mode: 'auto',
      presentationId: 'presentation-4',
      returnPath: '/features/hackathon-timer',
      scoresBefore: EMPTY_TEAMS,
      scoresAfter: EMPTY_TEAMS.map((team) => (
        team.teamId === 2 ? { ...team, total: 1 } : team.teamId === 5 ? { ...team, total: 2 } : team
      )),
      startedAt: Date.now() - 2_000,
    }
    window.sessionStorage.setItem(ACTIVE_PRESENTATION_KEY, JSON.stringify(presentation))

    render(<App />)

    expect(screen.getByText('2팀, 5팀에서 총 3건 MERGE!')).toBeInTheDocument()
    expect(screen.getByText('5팀 DOUBLE BOOST ×2')).toBeInTheDocument()
  })

  it('shows a large centered standings board before returning to the timer', () => {
    const presentation: MergePresentation = {
      batch: {
        createdAt: new Date().toISOString(),
        events: [],
        id: 'batch-final',
        teamChanges: [{ count: 1, teamId: 3, teamName: '3팀' }],
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
    expect(screen.getByText('깃허브 머지 횟수 기준')).toBeInTheDocument()
    expect(container.querySelector('.final-standings li strong')?.textContent).toBe('3팀')
  })
})
