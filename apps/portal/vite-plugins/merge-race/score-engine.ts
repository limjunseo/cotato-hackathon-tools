import { MERGE_RACE_START_AT, REPOSITORY_TEAM_MAP, TEAM_CONFIGS } from './team-config'
import type {
  MergeEvent,
  RawMergedPullRequest,
  RepositorySnapshot,
  TeamScore,
} from './types'

export type ValidMerge = Omit<MergeEvent, 'sequence'>

export function buildMergeKey(repositoryFullName: string, pullRequestNumber: number) {
  return `${repositoryFullName}#${pullRequestNumber}`
}

export function createEmptyScores(): TeamScore[] {
  return TEAM_CONFIGS.map((team) => ({
    client: 0,
    color: team.color,
    name: team.name,
    server: 0,
    teamId: team.id,
    total: 0,
  }))
}

export function selectValidMerges(
  pullRequests: RawMergedPullRequest[],
  defaultBranches: ReadonlyMap<string, string>,
  seenMergeKeys: ReadonlySet<string> = new Set(),
  startAt = MERGE_RACE_START_AT,
): ValidMerge[] {
  const startTimestamp = Date.parse(startAt)

  return pullRequests
    .flatMap((pullRequest): ValidMerge[] => {
      const teamMapping = REPOSITORY_TEAM_MAP.get(pullRequest.repositoryFullName)
      const defaultBranch = defaultBranches.get(pullRequest.repositoryFullName)
      const mergeKey = buildMergeKey(pullRequest.repositoryFullName, pullRequest.number)

      if (
        !teamMapping
        || !pullRequest.mergedAt
        || Date.parse(pullRequest.mergedAt) < startTimestamp
        || pullRequest.baseRefName !== defaultBranch
        || seenMergeKeys.has(mergeKey)
      ) {
        return []
      }

      return [{
        baseRefName: pullRequest.baseRefName,
        commitCount: 0,
        id: mergeKey,
        mergedAt: pullRequest.mergedAt,
        prNumber: pullRequest.number,
        repository: pullRequest.repositoryFullName,
        repositoryType: teamMapping.repositoryType,
        teamId: teamMapping.team.id,
        teamName: teamMapping.team.name,
        url: pullRequest.url,
      }]
    })
    .sort((first, second) => (
      Date.parse(first.mergedAt) - Date.parse(second.mergedAt)
      || first.id.localeCompare(second.id)
    ))
}

export function calculateScores(snapshots: ReadonlyMap<string, RepositorySnapshot>): TeamScore[] {
  const scores = createEmptyScores()
  const scoreByTeam = new Map(scores.map((score) => [score.teamId, score]))

  REPOSITORY_TEAM_MAP.forEach(({ repositoryType, team }, repository) => {
    const score = scoreByTeam.get(team.id)
    const commitCount = snapshots.get(repository)?.commitCount ?? 0
    if (!score) return

    score[repositoryType] += commitCount
    score.total += commitCount
  })

  return scores
}

export function getDefaultBranches(snapshots: ReadonlyMap<string, RepositorySnapshot>) {
  return new Map(
    [...snapshots].map(([repository, snapshot]) => [repository, snapshot.defaultBranch]),
  )
}

export function applyRepositoryCommitDeltas(
  merges: ValidMerge[],
  previousSnapshots: ReadonlyMap<string, RepositorySnapshot>,
  nextSnapshots: ReadonlyMap<string, RepositorySnapshot>,
) {
  const mergesByRepository = new Map<string, ValidMerge[]>()
  merges.forEach((merge) => {
    const repositoryMerges = mergesByRepository.get(merge.repository) ?? []
    repositoryMerges.push(merge)
    mergesByRepository.set(merge.repository, repositoryMerges)
  })

  const commitCountById = new Map<string, number>()
  mergesByRepository.forEach((repositoryMerges, repository) => {
    const previousCount = previousSnapshots.get(repository)?.commitCount ?? 0
    const nextCount = nextSnapshots.get(repository)?.commitCount ?? 0
    const delta = Math.max(0, nextCount - previousCount)
    const commitsPerMerge = Math.floor(delta / repositoryMerges.length)
    const remainder = delta % repositoryMerges.length

    repositoryMerges.forEach((merge, index) => {
      commitCountById.set(merge.id, commitsPerMerge + (index < remainder ? 1 : 0))
    })
  })

  return merges.map((merge) => ({
    ...merge,
    commitCount: commitCountById.get(merge.id) ?? 0,
  }))
}

export function haveAffectedCommitCountsAdvanced(
  merges: ValidMerge[],
  previousSnapshots: ReadonlyMap<string, RepositorySnapshot>,
  nextSnapshots: ReadonlyMap<string, RepositorySnapshot>,
) {
  return [...new Set(merges.map((merge) => merge.repository))].every((repository) => (
    (nextSnapshots.get(repository)?.commitCount ?? 0)
      > (previousSnapshots.get(repository)?.commitCount ?? 0)
  ))
}
