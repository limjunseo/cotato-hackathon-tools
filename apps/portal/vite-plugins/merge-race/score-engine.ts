import { MERGE_RACE_START_AT, REPOSITORY_TEAM_MAP, TEAM_CONFIGS } from './team-config'
import type { MergeEvent, RawMergedPullRequest, TeamScore } from './types'

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

export function calculateScores(merges: Array<ValidMerge | MergeEvent>): TeamScore[] {
  const scores = createEmptyScores()
  const scoreByTeam = new Map(scores.map((score) => [score.teamId, score]))

  merges.forEach((merge) => {
    const score = scoreByTeam.get(merge.teamId)
    if (!score) {
      return
    }

    score[merge.repositoryType] += 1
    score.total += 1
  })

  return scores
}
