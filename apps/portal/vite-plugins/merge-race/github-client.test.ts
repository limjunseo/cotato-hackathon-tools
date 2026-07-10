import { afterEach, describe, expect, it, vi } from 'vitest'
import { GitHubMergeClient } from './github-client'

afterEach(() => vi.unstubAllGlobals())

describe('GitHub commit race client', () => {
  it('reads actual default branch history counts since the event start', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body)) as {
        query: string
        variables: Record<string, string>
      }

      expect(request.query).toContain('history(since: $since)')
      expect(request.variables.since).toBe('2026-07-10T10:00:00.000Z')

      return new Response(JSON.stringify({
        data: {
          organization: {
            repositories: {
              nodes: [
                {
                  defaultBranchRef: {
                    name: 'main',
                    target: { history: { totalCount: 26 } },
                  },
                  nameWithOwner: '8th-COKERTHON/client-team1-',
                },
                {
                  defaultBranchRef: null,
                  nameWithOwner: '8th-COKERTHON/client-team6',
                },
              ],
            },
          },
          rateLimit: { cost: 1, remaining: 4_000, resetAt: '2026-07-11T02:00:00Z' },
        },
      }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new GitHubMergeClient('test-token')
    const snapshots = await client.fetchRepositorySnapshots('2026-07-10T10:00:00.000Z')

    expect(snapshots.get('8th-COKERTHON/client-team1-')).toEqual({
      commitCount: 26,
      defaultBranch: 'main',
    })
    expect(snapshots.has('8th-COKERTHON/client-team6')).toBe(false)
    expect(client.lastRateLimit?.cost).toBe(1)
  })
})
