import { describe, expect, it } from 'vitest'
import {
  COUNTDOWN_DURATION_MS,
  PINBALL_DRAW_DURATION_MS,
  RACE_DURATION_MS,
  getRaceTiming,
} from './pinball'

describe('getRaceTiming', () => {
  it.each([1, 2, 5, 10, 41])('finishes a %s winner race in about 15 seconds', (count) => {
    const timing = getRaceTiming(count)

    expect(timing.totalDuration).toBe(PINBALL_DRAW_DURATION_MS)
    expect(timing.countdownDuration).toBe(COUNTDOWN_DURATION_MS)
    expect(timing.raceDuration).toBe(RACE_DURATION_MS)
    expect(timing.winnerFinishTimes).toHaveLength(count)
    expect(timing.winnerFinishTimes.at(-1)).toBe(RACE_DURATION_MS)
  })

  it('keeps winner finish times ordered and sufficiently separated', () => {
    const finishTimes = getRaceTiming(41).winnerFinishTimes

    expect(finishTimes[0]).toBeGreaterThanOrEqual(3_000)
    expect(finishTimes.every((time, index) => index === 0 || time > finishTimes[index - 1])).toBe(true)
  })

  it.each([0, -1, 1.5, 42])('rejects an invalid winner count: %s', (count) => {
    expect(() => getRaceTiming(count)).toThrow(RangeError)
  })
})
