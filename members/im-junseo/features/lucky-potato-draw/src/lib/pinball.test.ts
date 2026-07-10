import { describe, expect, it } from 'vitest'
import {
  COUNTDOWN_DURATION_MS,
  PINBALL_DRAW_DURATION_MS,
  RACE_DRAMA,
  RACE_DURATION_MS,
  getRaceDramaAt,
  getRaceDramaProfile,
  getRaceTiming,
} from './pinball'

describe('getRaceTiming', () => {
  it.each([1, 2, 5, 10, 41])('finishes all 41 racers in about 15 seconds with %s winners', (count) => {
    const timing = getRaceTiming(count)

    expect(timing.totalDuration).toBe(PINBALL_DRAW_DURATION_MS)
    expect(timing.countdownDuration).toBe(COUNTDOWN_DURATION_MS)
    expect(timing.raceDuration).toBe(RACE_DURATION_MS)
    expect(timing.winnerFinishTimes).toHaveLength(count)
    expect(timing.finishTimes).toHaveLength(41)
    expect(timing.finishTimes.at(-1)).toBe(RACE_DURATION_MS)
    if (count < 41) {
      expect(timing.winnerFinishTimes.at(-1)).toBeLessThan(RACE_DURATION_MS)
    }
  })

  it('keeps winner finish times ordered and sufficiently separated', () => {
    const finishTimes = getRaceTiming(41).winnerFinishTimes

    expect(finishTimes[0]).toBeGreaterThanOrEqual(3_000)
    expect(finishTimes.every((time, index) => index === 0 || time > finishTimes[index - 1])).toBe(true)
  })

  it.each([0, -1, 1.5, 42])('rejects an invalid winner count: %s', (count) => {
    expect(() => getRaceTiming(count)).toThrow(RangeError)
  })

  it('supports an excluded field and lets every remaining racer finish', () => {
    const timing = getRaceTiming(5, 38)

    expect(timing.winnerFinishTimes).toHaveLength(5)
    expect(timing.finishTimes).toHaveLength(38)
    expect(timing.finishTimes.at(-1)).toBe(RACE_DURATION_MS)
  })
})

describe('race drama', () => {
  it('creates different deterministic pace profiles for each potato and round', () => {
    expect(getRaceDramaProfile(7, 2)).toEqual(getRaceDramaProfile(7, 2))
    expect(getRaceDramaProfile(7, 2)).not.toEqual(getRaceDramaProfile(8, 2))
    expect(getRaceDramaProfile(7, 2)).not.toEqual(getRaceDramaProfile(7, 3))
  })

  it('adds mid-race pace swings and settles them before the finish', () => {
    const profile = getRaceDramaProfile(12, 4)
    const midRaceOffsets = [0.2, 0.35, 0.5, 0.65]
      .map((progress) => getRaceDramaAt(profile, progress).progressOffset)

    expect(Math.max(...midRaceOffsets) - Math.min(...midRaceOffsets)).toBeGreaterThan(0.05)
    expect(Math.abs(getRaceDramaAt(profile, 1).progressOffset)).toBeLessThan(0.000_001)
    expect(getRaceDramaAt(profile, 1).gravityMultiplier).toBe(1)
    expect(RACE_DRAMA.leaderChangeThreshold).toBeGreaterThan(0)
  })
})
