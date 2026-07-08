import { describe, expect, it } from 'vitest'
import { HACKATHON_SCHEDULE } from '../data/hackathonSchedule'
import { DAY, HOUR, getCurrentSchedule, getScheduleStatus, getTimeParts, getUrgency } from './schedule'

const at = (value: string) => new Date(`${value}:00+09:00`).getTime()

describe('fixed hackathon schedule', () => {
  it('targets the opening ceremony before the hackathon starts', () => {
    const result = getCurrentSchedule(HACKATHON_SCHEDULE, at('2026-07-10T18:00'))

    expect(result.mode).toBe('before')
    expect(result.item?.id).toBe('opening')
    expect(result.targetTime).toBe(at('2026-07-10T19:00'))
  })

  it('tracks the end of the currently active session', () => {
    const now = at('2026-07-10T20:00')
    const result = getCurrentSchedule(HACKATHON_SCHEDULE, now)

    expect(result.mode).toBe('active')
    expect(result.item?.id).toBe('planning')
    expect(result.targetTime).toBe(at('2026-07-10T23:00'))
    expect(getScheduleStatus(result.item!, now)).toBe('active')
  })

  it('crosses midnight into the proposal submission session', () => {
    const result = getCurrentSchedule(
      HACKATHON_SCHEDULE,
      at('2026-07-11T00:30'),
    )

    expect(result.item?.id).toBe('proposal')
    expect(result.item?.isDeadline).toBe(true)
    expect(result.targetTime).toBe(at('2026-07-11T01:00'))
  })

  it('moves to focused development at the exact 01:00 boundary', () => {
    const now = at('2026-07-11T01:00')
    const result = getCurrentSchedule(HACKATHON_SCHEDULE, now)

    expect(result.item?.id).toBe('deep-work')
    expect(getScheduleStatus(HACKATHON_SCHEDULE[3], now)).toBe('completed')
  })

  it('completes after cleanup ends at 14:30', () => {
    const result = getCurrentSchedule(
      HACKATHON_SCHEDULE,
      at('2026-07-11T14:30'),
    )

    expect(result).toEqual({ item: null, targetTime: null, mode: 'complete' })
  })
})

describe('countdown calculations', () => {
  it('changes urgency at the one-hour and ten-minute boundaries', () => {
    const now = 10_000
    expect(getUrgency(now + HOUR + 1, now)).toBe('normal')
    expect(getUrgency(now + HOUR, now)).toBe('urgent')
    expect(getUrgency(now + 10 * 60_000, now)).toBe('critical')
    expect(getUrgency(null, now)).toBe('complete')
  })

  it('splits time across days and clamps completed values to zero', () => {
    const now = 5_000
    expect(getTimeParts(now + 2 * DAY + 3 * HOUR + 4 * 60_000 + 5_000, now)).toEqual({
      total: 2 * DAY + 3 * HOUR + 4 * 60_000 + 5_000,
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    })
    expect(getTimeParts(now - 1, now).total).toBe(0)
  })
})
