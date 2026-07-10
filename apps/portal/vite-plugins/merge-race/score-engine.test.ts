import { describe, expect, it } from 'vitest'
import {
  applyRepositoryCommitDeltas,
  calculateScores,
  haveAffectedCommitCountsAdvanced,
  selectValidMerges,
} from './score-engine'
import type { RawMergedPullRequest, RepositorySnapshot } from './types'

const defaults = new Map([
  ['8th-COKERTHON/client-team3', 'main'],
  ['8th-COKERTHON/server-team3', 'develop'],
  ['8th-COKERTHON/client-team5', 'main'],
])

function pullRequest(overrides: Partial<RawMergedPullRequest> = {}): RawMergedPullRequest {
  return {
    baseRefName: 'main',
    mergedAt: '2026-07-10T11:00:00.000Z',
    number: 12,
    repositoryFullName: '8th-COKERTHON/client-team3',
    url: 'https://github.com/8th-COKERTHON/client-team3/pull/12',
    ...overrides,
  }
}

describe('merge score engine', () => {
  it('accepts client and server PRs merged into each repository default branch', () => {
    const merges = selectValidMerges([
      pullRequest(),
      pullRequest({
        baseRefName: 'develop',
        number: 7,
        repositoryFullName: '8th-COKERTHON/server-team3',
      }),
    ], defaults)

    expect(merges).toHaveLength(2)
    expect(merges.every((merge) => merge.commitCount === 0)).toBe(true)
  })

  it('calculates scores from actual default branch commit snapshots', () => {
    const snapshots = new Map<string, RepositorySnapshot>([
      ['8th-COKERTHON/client-team3', { commitCount: 3, defaultBranch: 'main' }],
      ['8th-COKERTHON/server-team3', { commitCount: 5, defaultBranch: 'develop' }],
    ])

    expect(calculateScores(snapshots)).toContainEqual(expect.objectContaining({
      teamId: 3,
      client: 3,
      server: 5,
      total: 8,
    }))
  })

  it('rejects non-default branches, pre-event merges, unknown repositories, and duplicate PRs', () => {
    const seen = new Set(['8th-COKERTHON/client-team3#20'])
    const merges = selectValidMerges([
      pullRequest({ baseRefName: 'develop' }),
      pullRequest({ mergedAt: '2026-07-10T09:59:59.999Z', number: 13 }),
      pullRequest({ repositoryFullName: '8th-COKERTHON/random-repo', number: 14 }),
      pullRequest({ number: 20 }),
    ], defaults, seen)

    expect(merges).toEqual([])
  })

  it('distributes each repository commit delta without double-counting multiple merges', () => {
    const merges = selectValidMerges([
      pullRequest({ number: 1 }),
      pullRequest({ number: 2 }),
      pullRequest({ number: 5, repositoryFullName: '8th-COKERTHON/client-team5' }),
    ], defaults)
    const previous = new Map<string, RepositorySnapshot>([
      ['8th-COKERTHON/client-team3', { commitCount: 10, defaultBranch: 'main' }],
      ['8th-COKERTHON/client-team5', { commitCount: 8, defaultBranch: 'main' }],
    ])
    const next = new Map<string, RepositorySnapshot>([
      ['8th-COKERTHON/client-team3', { commitCount: 15, defaultBranch: 'main' }],
      ['8th-COKERTHON/client-team5', { commitCount: 10, defaultBranch: 'main' }],
    ])
    const scoredMerges = applyRepositoryCommitDeltas(merges, previous, next)

    expect(scoredMerges.map((merge) => merge.commitCount)).toEqual([3, 2, 2])
    expect(scoredMerges.reduce((total, merge) => total + merge.commitCount, 0)).toBe(7)
    expect(haveAffectedCommitCountsAdvanced(merges, previous, next)).toBe(true)
  })

  it('waits when GitHub search sees a merge before branch history advances', () => {
    const merges = selectValidMerges([pullRequest()], defaults)
    const snapshots = new Map<string, RepositorySnapshot>([
      ['8th-COKERTHON/client-team3', { commitCount: 10, defaultBranch: 'main' }],
    ])

    expect(haveAffectedCommitCountsAdvanced(merges, snapshots, snapshots)).toBe(false)
  })
})
