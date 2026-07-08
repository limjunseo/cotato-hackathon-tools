import { AnimatePresence, motion } from 'motion/react'
import { getTimeParts } from '../lib/schedule'
import type { Urgency } from '../types'

type CountdownProps = {
  targetTime: number | null
  now: number
  urgency: Urgency
}

const UNITS = [
  ['days', 'DAYS', '일'],
  ['hours', 'HOURS', '시'],
  ['minutes', 'MINUTES', '분'],
  ['seconds', 'SECONDS', '초'],
] as const

export function Countdown({ targetTime, now, urgency }: CountdownProps) {
  const time = getTimeParts(targetTime, now)

  return (
    <div className="countdown" aria-label={`남은 시간 ${time.days}일 ${time.hours}시간 ${time.minutes}분 ${time.seconds}초`}>
      {UNITS.map(([key, english, korean]) => {
        const value = String(time[key]).padStart(2, '0')
        return (
          <div className="time-unit" key={key}>
            <motion.div
              className="keycap"
              animate={
                urgency === 'critical' && key === 'seconds'
                  ? { y: [0, 2, 0], scale: [1, 0.985, 1] }
                  : { y: 0, scale: 1 }
              }
              transition={{ duration: 1, repeat: urgency === 'critical' ? Infinity : 0 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  className="time-value"
                  key={value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10, position: 'absolute' }}
                  transition={{ duration: 0.18 }}
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </motion.div>
            <span className="time-label">
              {english} · {korean}
            </span>
          </div>
        )
      })}
    </div>
  )
}
