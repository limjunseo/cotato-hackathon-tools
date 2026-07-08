import { AnimatePresence, motion } from 'motion/react'
import type { Urgency } from '../types'

const MASCOT_STATE = {
  normal: {
    kind: 'coding',
    message: '집중 모드 ON',
    animation: { y: [0, -5, 0], rotate: [0, 0.6, 0] },
    duration: 3.8,
  },
  urgent: {
    kind: 'tired',
    message: '마감이 가까워요!',
    animation: { y: [0, -3, 0], rotate: [-1, 1, -1] },
    duration: 1.6,
  },
  critical: {
    kind: 'surprised',
    message: '10분 전! 제출 확인!',
    animation: { y: [0, -10, 0], rotate: [-2, 2, -2] },
    duration: 0.7,
  },
  complete: {
    kind: 'wave',
    message: 'MISSION COMPLETE!',
    animation: { y: [0, -7, 0], rotate: [-1, 1, -1] },
    duration: 2.1,
  },
}

export function Mascot({ urgency }: { urgency: Urgency }) {
  const state = MASCOT_STATE[urgency]

  return (
    <aside className="mascot-zone" aria-label={state.message}>
      <div className="mascot-shadow" />
      <AnimatePresence mode="wait">
        <motion.div
          className={`mascot mascot--${state.kind}`}
          key={state.kind}
          initial={{ opacity: 0, scale: 0.7, x: 35 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            ...state.animation,
          }}
          exit={{ opacity: 0, scale: 0.82, x: -25 }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { type: 'spring', stiffness: 260, damping: 18 },
            x: { type: 'spring', stiffness: 230, damping: 20 },
            y: { duration: state.duration, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: state.duration, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.span
          className="mascot-message"
          key={state.message}
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.2, duration: 0.25 }}
        >
          {state.message}
        </motion.span>
      </AnimatePresence>
    </aside>
  )
}
