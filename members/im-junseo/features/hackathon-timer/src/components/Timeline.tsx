import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { getScheduleStatus } from '../lib/schedule'
import type { ScheduleItem, ScheduleStatus } from '../types'

const STATUS_COPY: Record<ScheduleStatus, string> = {
  completed: '종료',
  active: '진행 중',
  upcoming: '예정',
}

type TimelineProps = {
  schedule: ScheduleItem[]
  now: number
  activeId?: string
}

export function Timeline({ schedule, now, activeId }: TimelineProps) {
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId || !railRef.current) return
    const active = railRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeId])

  return (
    <section className="timeline-shell" aria-label="전체 타임테이블">
      <div className="timeline-header">
        <h2>OFFICIAL TIMETABLE</h2>
        <span>JUL 10 19:00 — JUL 11 14:30 · {schedule.length} SESSIONS</span>
      </div>
      <div className="timeline" ref={railRef}>
        {schedule.map((item, index) => {
          const status = getScheduleStatus(item, now)
          const active = item.id === activeId
          return (
            <motion.article
              className={`timeline-item timeline-item--${status}`}
              data-active={active}
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.3 }}
              title={item.details}
            >
              <span className="timeline-dot">
                {status === 'completed' ? '✓' : String(index + 1).padStart(2, '0')}
              </span>
              <span className="timeline-copy">
                <span className="timeline-status">
                  {STATUS_COPY[status]} {item.isDeadline && '· DEADLINE'}
                </span>
                <span className="timeline-title">{item.title}</span>
                <span className="timeline-date">{item.timeLabel}</span>
              </span>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
