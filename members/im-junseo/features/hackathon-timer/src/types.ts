export type ScheduleItem = {
  id: string
  title: string
  details: string
  timeLabel: string
  startAt: number
  endAt: number
  isDeadline?: boolean
}

export type ScheduleStatus = 'completed' | 'active' | 'upcoming'
export type ScheduleMode = 'before' | 'active' | 'complete'
export type Urgency = 'normal' | 'urgent' | 'critical' | 'complete'

export type CurrentSchedule = {
  item: ScheduleItem | null
  targetTime: number | null
  mode: ScheduleMode
}
