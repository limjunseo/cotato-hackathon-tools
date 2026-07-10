export const COUNTDOWN_DURATION_MS = 2_500
export const RACE_DURATION_MS = 12_500
export const PINBALL_DRAW_DURATION_MS = COUNTDOWN_DURATION_MS + RACE_DURATION_MS

const EARLIEST_WINNER_MS = 3_000
const DEFAULT_WINNER_WINDOW_MS = 5_500
const MINIMUM_WINNER_GAP_MS = 240
const TRAILING_FINISH_WINDOW_MS = 2_200
const TRAILING_FINISH_DELAY_MS = 180

export const RACE_DRAMA = {
  settleStart: 0.72,
  settleEnd: 0.92,
  minimumProgressSwing: 0.1,
  maximumProgressSwing: 0.18,
  minimumGravitySwing: 0.28,
  maximumGravitySwing: 0.52,
  leaderChangeThreshold: 0.008,
  finishFocusWindowMs: 950,
} as const

export type RaceDramaProfile = {
  gravitySwing: number
  paceCycles: number
  pacePhase: number
  progressSwing: number
}

export type RaceTiming = {
  countdownDuration: number
  raceDuration: number
  totalDuration: number
  finishTimes: number[]
  winnerFinishTimes: number[]
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43_758.5453
  return value - Math.floor(value)
}

export function getRaceDramaProfile(number: number, runId: number): RaceDramaProfile {
  const seed = number * 97 + runId * 131

  return {
    gravitySwing: RACE_DRAMA.minimumGravitySwing
      + seededUnit(seed + 3) * (RACE_DRAMA.maximumGravitySwing - RACE_DRAMA.minimumGravitySwing),
    paceCycles: 1.7 + seededUnit(seed + 2) * 1.8,
    pacePhase: seededUnit(seed + 1) * Math.PI * 2,
    progressSwing: RACE_DRAMA.minimumProgressSwing
      + seededUnit(seed + 4) * (RACE_DRAMA.maximumProgressSwing - RACE_DRAMA.minimumProgressSwing),
  }
}

export function getRaceDramaAt(profile: RaceDramaProfile, raceProgress: number) {
  const progress = Math.max(0, Math.min(1, raceProgress))
  const entrance = Math.min(1, progress / 0.08)
  const settleProgress = Math.max(0, Math.min(
    1,
    (progress - RACE_DRAMA.settleStart) / (RACE_DRAMA.settleEnd - RACE_DRAMA.settleStart),
  ))
  const dramaStrength = entrance * (1 - settleProgress)
  const primaryWave = Math.sin(
    profile.pacePhase + progress * Math.PI * 2 * profile.paceCycles,
  )
  const secondaryWave = Math.sin(
    profile.pacePhase * 0.61 + progress * Math.PI * 2 * (profile.paceCycles * 0.53 + 0.4),
  )
  const paceWave = primaryWave * 0.72 + secondaryWave * 0.28

  return {
    gravityMultiplier: Math.max(
      0.55,
      Math.min(1.55, 1 + paceWave * profile.gravitySwing * dramaStrength),
    ),
    progressOffset: paceWave * profile.progressSwing * dramaStrength,
  }
}

export function getRaceTiming(winnerCount: number, participantCount = 41): RaceTiming {
  if (!Number.isInteger(participantCount) || participantCount < 1 || participantCount > 41) {
    throw new RangeError('participantCount must be between 1 and 41')
  }
  if (!Number.isInteger(winnerCount) || winnerCount < 1 || winnerCount > participantCount) {
    throw new RangeError('winnerCount must be between 1 and participantCount')
  }

  const trailingCount = participantCount - winnerCount
  const lastWinnerAt = trailingCount > 0
    ? RACE_DURATION_MS - TRAILING_FINISH_WINDOW_MS
    : RACE_DURATION_MS
  const winnerWindow = Math.max(
    DEFAULT_WINNER_WINDOW_MS,
    (winnerCount - 1) * MINIMUM_WINNER_GAP_MS,
  )
  const firstWinnerAt = winnerCount === 1
    ? lastWinnerAt
    : Math.max(EARLIEST_WINNER_MS, lastWinnerAt - winnerWindow)
  const winnerGap = winnerCount === 1
    ? 0
    : (lastWinnerAt - firstWinnerAt) / (winnerCount - 1)
  const winnerFinishTimes = Array.from(
    { length: winnerCount },
    (_, index) => firstWinnerAt + winnerGap * index,
  )
  const trailingStartAt = lastWinnerAt + TRAILING_FINISH_DELAY_MS
  const trailingFinishTimes = Array.from({ length: trailingCount }, (_, index) => {
    if (trailingCount === 1) {
      return RACE_DURATION_MS
    }

    return trailingStartAt
      + (RACE_DURATION_MS - trailingStartAt) * index / (trailingCount - 1)
  })

  return {
    countdownDuration: COUNTDOWN_DURATION_MS,
    raceDuration: RACE_DURATION_MS,
    totalDuration: PINBALL_DRAW_DURATION_MS,
    finishTimes: [...winnerFinishTimes, ...trailingFinishTimes],
    winnerFinishTimes,
  }
}
