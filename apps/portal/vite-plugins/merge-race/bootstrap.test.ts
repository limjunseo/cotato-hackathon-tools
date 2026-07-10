import { describe, expect, it } from 'vitest'
import { prepareBootstrap } from './bootstrap'
import type { ValidMerge } from './score-engine'
import type { RuntimeState } from './types'

function merge(id: string): ValidMerge {
  return {
    baseRefName: 'main',
    commitCount: 3,
    id,
    mergedAt: '2026-07-11T00:00:00.000Z',
    prNumber: 1,
    repository: '8th-COKERTHON/client-team1-',
    repositoryType: 'client',
    teamId: 1,
    teamName: '1팀',
    url: 'https://github.com/example',
  }
}

describe('merge poller bootstrap', () => {
  it('restores historical scores as seen without replaying first-run notifications', () => {
    const result = prepareBootstrap([merge('repo#1'), merge('repo#2')], null)

    expect(result.notificationMerges).toEqual([])
    expect([...result.seenMergeKeys]).toEqual(['repo#1', 'repo#2'])
    expect(result.latestSequence).toBe(0)
  })

  it('recovers only merges that happened while a previous server instance was offline', () => {
    const runtime: RuntimeState = {
      initializedAt: '2026-07-10T10:00:00.000Z',
      lastSuccessfulPollAt: '2026-07-10T12:00:00.000Z',
      latestSequence: 7,
      schemaVersion: 1,
      seenMergeKeys: ['repo#1'],
    }
    const result = prepareBootstrap([merge('repo#1'), merge('repo#2')], runtime)

    expect(result.notificationMerges.map((item) => item.id)).toEqual(['repo#2'])
    expect(result.latestSequence).toBe(7)
  })
})
