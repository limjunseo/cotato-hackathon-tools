import type { AwardStage } from '../types'

export const AWARD_STAGES: AwardStage[] = ['intro', 'third', 'second', 'first', 'complete']

export function moveStage(stage: AwardStage, direction: 1 | -1) {
  const currentIndex = AWARD_STAGES.indexOf(stage)
  const nextIndex = Math.min(AWARD_STAGES.length - 1, Math.max(0, currentIndex + direction))
  return AWARD_STAGES[nextIndex]
}

export function getStageNumber(stage: AwardStage) {
  return AWARD_STAGES.indexOf(stage)
}
