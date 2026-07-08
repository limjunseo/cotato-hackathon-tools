import type {
  CurrentSchedule,
  ScheduleItem,
  ScheduleStatus,
  Urgency,
} from '../types'

export const HOUR = 60 * 60 * 1_000
export const DAY = 24 * HOUR

export function getCurrentSchedule(
  schedule: ScheduleItem[],
  now: number,
): CurrentSchedule {
  if (schedule.length === 0) {
    return { item: null, targetTime: null, mode: 'complete' }
  }

  const first = schedule[0]
  if (now < first.startAt) {
    return { item: first, targetTime: first.startAt, mode: 'before' }
  }

  const active = schedule.find((item) => now >= item.startAt && now < item.endAt)
  if (active) {
    return { item: active, targetTime: active.endAt, mode: 'active' }
  }

  const upcoming = schedule.find((item) => item.startAt > now)
  if (upcoming) {
    return { item: upcoming, targetTime: upcoming.startAt, mode: 'before' }
  }

  return { item: null, targetTime: null, mode: 'complete' }
}

export function getScheduleStatus(
  item: ScheduleItem,
  now: number,
): ScheduleStatus {
  if (now >= item.endAt) return 'completed'
  if (now >= item.startAt) return 'active'
  return 'upcoming'
}

export function getUrgency(targetTime: number | null, now: number): Urgency {
  if (targetTime === null) return 'complete'
  const remaining = targetTime - now
  if (remaining <= 0) return 'complete'
  if (remaining <= 10 * 60 * 1_000) return 'critical'
  if (remaining <= HOUR) return 'urgent'
  return 'normal'
}

export function getTimeParts(targetTime: number | null, now: number) {
  const remaining = targetTime === null ? 0 : Math.max(0, targetTime - now)
  return {
    total: remaining,
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1_000),
  }
}

export function formatKoreanDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp)
}
