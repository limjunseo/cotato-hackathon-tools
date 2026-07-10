import { describe, expect, it } from 'vitest'
import { buildAnnouncement, createBatch, getPresentationPhase, getRankedTeams } from './presentation'
import type { MergeEvent, TeamScore } from '../types'

function event(teamId: number, sequence: number): MergeEvent {
  return {
    baseRefName: 'main',
    id: `repo-${teamId}#${sequence}`,
    mergedAt: '2026-07-11T00:00:00.000Z',
    prNumber: sequence,
    repository: `8th-COKERTHON/client-team${teamId}`,
    repositoryType: 'client',
    sequence,
    teamId,
    teamName: `${teamId}팀`,
    url: 'https://github.com/example',
  }
}

describe('merge race presentation', () => {
  it('groups multiple events into one batch and announces the total', () => {
    const batch = createBatch([event(2, 1), event(2, 2), event(5, 3)], 'batch-1')

    expect(batch.totalMerges).toBe(3)
    expect(batch.teamChanges).toEqual([
      { count: 2, teamId: 2, teamName: '2팀' },
      { count: 1, teamId: 5, teamName: '5팀' },
    ])
    expect(buildAnnouncement(batch)).toBe('2팀, 5팀에서 총 3건 MERGE!')
  })

  it('uses the 15 second presentation timeline', () => {
    expect(getPresentationPhase(0, true)).toBe('detected')
    expect(getPresentationPhase(1_500, true)).toBe('announcement')
    expect(getPresentationPhase(5_000, true)).toBe('race')
    expect(getPresentationPhase(11_000, true)).toBe('standings')
    expect(getPresentationPhase(14_500, true)).toBe('exit')
    expect(getPresentationPhase(0, false)).toBe('manual')
  })

  it('keeps tied teams on the same competition rank', () => {
    const teams: TeamScore[] = [
      { teamId: 1, name: '1팀', color: '#1', total: 7, client: 4, server: 3 },
      { teamId: 2, name: '2팀', color: '#2', total: 8, client: 4, server: 4 },
      { teamId: 3, name: '3팀', color: '#3', total: 8, client: 5, server: 3 },
      { teamId: 4, name: '4팀', color: '#4', total: 6, client: 3, server: 3 },
    ]

    expect(getRankedTeams(teams).map(({ rank, team }) => [rank, team.teamId])).toEqual([
      [1, 2], [1, 3], [3, 1], [4, 4],
    ])
  })
})
