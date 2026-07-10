export const COUNTDOWN_DURATION_MS = 2_500
export const RACE_DURATION_MS = 12_500
export const PINBALL_DRAW_DURATION_MS = COUNTDOWN_DURATION_MS + RACE_DURATION_MS

const EARLIEST_WINNER_MS = 3_000
const DEFAULT_WINNER_WINDOW_MS = 5_500
const MINIMUM_WINNER_GAP_MS = 240

export type RaceTiming = {
  countdownDuration: number
  raceDuration: number
  totalDuration: number
  winnerFinishTimes: number[]
}

export function getRaceTiming(winnerCount: number): RaceTiming {
  if (!Number.isInteger(winnerCount) || winnerCount < 1 || winnerCount > 41) {
    throw new RangeError('winnerCount must be between 1 and 41')
  }

  const winnerWindow = Math.max(
    DEFAULT_WINNER_WINDOW_MS,
    (winnerCount - 1) * MINIMUM_WINNER_GAP_MS,
  )
  const firstWinnerAt = winnerCount === 1
    ? RACE_DURATION_MS
    : Math.max(EARLIEST_WINNER_MS, RACE_DURATION_MS - winnerWindow)
  const winnerGap = winnerCount === 1
    ? 0
    : (RACE_DURATION_MS - firstWinnerAt) / (winnerCount - 1)
  const winnerFinishTimes = Array.from(
    { length: winnerCount },
    (_, index) => firstWinnerAt + winnerGap * index,
  )

  return {
    countdownDuration: COUNTDOWN_DURATION_MS,
    raceDuration: RACE_DURATION_MS,
    totalDuration: PINBALL_DRAW_DURATION_MS,
    winnerFinishTimes,
  }
}
