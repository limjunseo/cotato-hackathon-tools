import { MERGE_RACE_ORGANIZATION } from './team-config'
import type { RateLimitState, RawMergedPullRequest, RepositorySnapshot } from './types'

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

type GraphQLError = {
  message: string
}

type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLError[]
}

type RateLimitResponse = {
  rateLimit: RateLimitState
}

export class GitHubClientError extends Error {
  retryAt: string | null
  status: number | null

  constructor(message: string, status: number | null = null, retryAt: string | null = null) {
    super(message)
    this.name = 'GitHubClientError'
    this.retryAt = retryAt
    this.status = status
  }
}

function getRetryAt(response: Response) {
  const retryAfter = response.headers.get('retry-after')
  if (retryAfter) {
    return new Date(Date.now() + Number(retryAfter) * 1_000).toISOString()
  }

  const resetAt = response.headers.get('x-ratelimit-reset')
  return resetAt ? new Date(Number(resetAt) * 1_000).toISOString() : null
}

export class GitHubMergeClient {
  lastRateLimit: RateLimitState | null = null
  private readonly token: string

  constructor(token: string) {
    this.token = token
  }

  private async execute<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    let response: Response

    try {
      response = await fetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${this.token}`,
          'content-type': 'application/json',
          'user-agent': 'cotato-merge-race',
        },
        body: JSON.stringify({ query, variables }),
      })
    } catch (error) {
      throw new GitHubClientError(
        error instanceof Error ? error.message : 'GitHub network request failed.',
      )
    }

    if (!response.ok) {
      throw new GitHubClientError(
        `GitHub API returned ${response.status}.`,
        response.status,
        getRetryAt(response),
      )
    }

    const payload = await response.json() as GraphQLResponse<T>
    if (payload.errors?.length || !payload.data) {
      throw new GitHubClientError(
        payload.errors?.map((error) => error.message).join(', ') || 'GitHub returned no data.',
      )
    }

    return payload.data
  }

  async fetchRepositorySnapshots(since: string) {
    const data = await this.execute<RateLimitResponse & {
      organization: {
        repositories: {
          nodes: Array<{
            defaultBranchRef: {
              name: string
              target: { history: { totalCount: number } } | null
            } | null
            nameWithOwner: string
          }>
        }
      } | null
    }>(`
      query CommitRaceRepositories($organization: String!, $since: GitTimestamp!) {
        organization(login: $organization) {
          repositories(first: 100, orderBy: { field: NAME, direction: ASC }) {
            nodes {
              nameWithOwner
              defaultBranchRef {
                name
                target {
                  ... on Commit {
                    history(since: $since) { totalCount }
                  }
                }
              }
            }
          }
        }
        rateLimit { cost remaining resetAt }
      }
    `, { organization: MERGE_RACE_ORGANIZATION, since })

    this.lastRateLimit = data.rateLimit
    if (!data.organization) {
      throw new GitHubClientError(`Organization ${MERGE_RACE_ORGANIZATION} was not found.`)
    }

    return new Map<string, RepositorySnapshot>(
      data.organization.repositories.nodes.flatMap((repository) => (
        repository.defaultBranchRef?.target
          ? [[repository.nameWithOwner, {
              commitCount: repository.defaultBranchRef.target.history.totalCount,
              defaultBranch: repository.defaultBranchRef.name,
            }] as const]
          : []
      )),
    )
  }

  async fetchMergedPullRequests(since: string): Promise<RawMergedPullRequest[]> {
    const exactSince = Date.parse(since)
    const searchDate = new Date(exactSince).toISOString().slice(0, 10)
    const searchQuery = `org:${MERGE_RACE_ORGANIZATION} is:pr is:merged merged:>=${searchDate} sort:updated-desc`
    const pullRequests: RawMergedPullRequest[] = []
    let cursor: string | null = null

    for (let page = 0; page < 10; page += 1) {
      const data: RateLimitResponse & {
        search: {
          nodes: Array<{
            baseRefName: string
            mergedAt: string | null
            number: number
            repository: { nameWithOwner: string }
            url: string
          } | null>
          pageInfo: { endCursor: string | null; hasNextPage: boolean }
        }
      } = await this.execute(`
        query MergeRacePullRequests($query: String!, $cursor: String) {
          search(query: $query, type: ISSUE, first: 100, after: $cursor) {
            nodes {
              ... on PullRequest {
                number
                mergedAt
                baseRefName
                url
                repository { nameWithOwner }
              }
            }
            pageInfo { endCursor hasNextPage }
          }
          rateLimit { cost remaining resetAt }
        }
      `, { cursor, query: searchQuery })

      this.lastRateLimit = data.rateLimit
      const pagePullRequests = data.search.nodes.flatMap((pullRequest) => {
        if (!pullRequest?.mergedAt || Date.parse(pullRequest.mergedAt) < exactSince) {
          return []
        }

        return [{
          baseRefName: pullRequest.baseRefName,
          mergedAt: pullRequest.mergedAt,
          number: pullRequest.number,
          repositoryFullName: pullRequest.repository.nameWithOwner,
          url: pullRequest.url,
        }]
      })
      pullRequests.push(...pagePullRequests)

      if (!data.search.pageInfo.hasNextPage || !data.search.pageInfo.endCursor) {
        break
      }
      cursor = data.search.pageInfo.endCursor
    }

    return pullRequests
  }
}
