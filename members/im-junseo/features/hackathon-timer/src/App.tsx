import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import './App.css'
import { Countdown } from './components/Countdown'
import { Mascot } from './components/Mascot'
import { Timeline } from './components/Timeline'
import {
  EVENT_DATE_LABEL,
  EVENT_NAME,
  HACKATHON_SCHEDULE,
} from './data/hackathonSchedule'
import {
  formatKoreanDateTime,
  getCurrentSchedule,
  getUrgency,
} from './lib/schedule'

const SECOND = 1_000

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  )
}

function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {active ? (
        <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      ) : (
        <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
      )}
    </svg>
  )
}

function App() {
  const [now, setNow] = useState(() => Date.now())
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), SECOND)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFullscreen)
    return () => document.removeEventListener('fullscreenchange', handleFullscreen)
  }, [])

  const current = getCurrentSchedule(HACKATHON_SCHEDULE, now)
  const urgency = getUrgency(current.targetTime, now)
  const completedCount = HACKATHON_SCHEDULE.filter((item) => item.endAt <= now).length

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // Browsers may block fullscreen outside a trusted user gesture.
    }
  }

  const eyebrow =
    current.mode === 'before'
      ? 'HACKATHON STARTS IN'
      : current.mode === 'active'
        ? current.item?.isDeadline
          ? 'SUBMISSION DEADLINE'
          : 'CURRENT SESSION'
        : 'ALL SESSIONS COMPLETE'

  const timeContext =
    current.mode === 'before'
      ? 'START'
      : current.item?.isDeadline
        ? 'DEADLINE'
        : 'ENDS'

  return (
    <main className={`app app--${urgency}`}>
      <div className="ambient-grid" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--two" aria-hidden="true" />
      <div className="pixel-stars" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>

      <header className="topbar">
        <div className="brand" aria-label="COTATO">
          <Mark />
          <span className="brand-name">COTATO</span>
          <span className="brand-divider" />
          <span className="event-name">{EVENT_NAME}</span>
        </div>

        <div className="topbar-actions">
          <span className="event-date">{EVENT_DATE_LABEL}</span>
          <span className="system-status"><i />LIVE</span>
          <button
            className="icon-button"
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? '전체 화면 종료' : '전체 화면'}
            title={isFullscreen ? '전체 화면 종료' : '전체 화면'}
          >
            <FullscreenIcon active={isFullscreen} />
          </button>
        </div>
      </header>

      <section className="hero" aria-live="polite">
        <div className="hero-copy">
          <p className="eyebrow"><span />{eyebrow}<span /></p>

          <AnimatePresence mode="wait">
            <motion.div
              className="mission"
              key={current.item?.id ?? 'complete'}
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1>{current.item?.title ?? '코커톤 종료'}</h1>
              <p className="mission-description">
                {current.item?.details ?? '모든 공식 일정을 성공적으로 완료했습니다.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <Countdown targetTime={current.targetTime} now={now} urgency={urgency} />

          <p className="deadline">
            <span>{current.item ? timeContext : 'COMPLETE'}</span>
            {current.targetTime
              ? formatKoreanDateTime(current.targetTime)
              : `${completedCount}개 일정 완료`}
          </p>
        </div>

        <Mascot urgency={urgency} />
      </section>

      <Timeline
        schedule={HACKATHON_SCHEDULE}
        now={now}
        activeId={current.item?.id}
      />

      <footer className="footer">
        <p>COde Together, Arrive TOgether</p>
        <span>COTATO HACKATHON SYSTEM · FIXED TIMETABLE</span>
      </footer>
    </main>
  )
}

export default App
