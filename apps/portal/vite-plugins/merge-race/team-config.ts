import type { TeamConfig } from './types'

export const MERGE_RACE_ORGANIZATION = '8th-COKERTHON'
export const MERGE_RACE_START_AT = '2026-07-10T10:00:00.000Z'
export const MERGE_POLL_INTERVAL_MS = 5_000
export const MERGE_LOOKBACK_MS = 30_000
export const MERGE_PRESENTATION_DURATION_MS = 15_000

export const TEAM_CONFIGS: TeamConfig[] = [
  {
    id: 1,
    name: '1팀',
    color: '#ff8c42',
    repositories: { client: 'client-team1-', server: 'server-team1' },
  },
  {
    id: 2,
    name: '2팀',
    color: '#55d6be',
    repositories: { client: 'client-team2', server: 'server-team2' },
  },
  {
    id: 3,
    name: '3팀',
    color: '#ffd166',
    repositories: { client: 'client-team3', server: 'server-team3' },
  },
  {
    id: 4,
    name: '4팀',
    color: '#70a1ff',
    repositories: { client: 'client-team4', server: 'server-team4' },
  },
  {
    id: 5,
    name: '5팀',
    color: '#ff6b9d',
    repositories: { client: 'client-team5', server: 'server-team5' },
  },
  {
    id: 6,
    name: '6팀',
    color: '#b388ff',
    repositories: { client: 'client-team6', server: 'server-team6' },
  },
]

export const REPOSITORY_TEAM_MAP: Map<
  string,
  { repositoryType: 'client' | 'server'; team: TeamConfig }
> = new Map(
  TEAM_CONFIGS.flatMap((team) => (
    (Object.entries(team.repositories) as Array<['client' | 'server', string]>).map(
      ([repositoryType, repository]) => [
        `${MERGE_RACE_ORGANIZATION}/${repository}`,
        { repositoryType, team },
      ] as const,
    )
  )),
)
