import { describe, expect, it } from 'vitest'
import { calculateScores, selectValidMerges } from './score-engine'
import type { RawMergedPullRequest } from './types'

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
    expect(calculateScores(merges)).toContainEqual(expect.objectContaining({
      teamId: 3,
      client: 1,
      server: 1,
      total: 2,
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

  it('counts multiple teams found in the same poll without collapsing same-team merges', () => {
    const merges = selectValidMerges([
      pullRequest({ number: 1 }),
      pullRequest({ number: 2 }),
      pullRequest({ number: 5, repositoryFullName: '8th-COKERTHON/client-team5' }),
    ], defaults)
    const scores = calculateScores(merges)

    expect(scores).toContainEqual(expect.objectContaining({ teamId: 3, total: 2 }))
    expect(scores).toContainEqual(expect.objectContaining({ teamId: 5, total: 1 }))
  })
})
