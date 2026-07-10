import { useEffect, useRef, useState } from 'react'
import { Leaderboard } from './components/Leaderboard'
import { FinalStandings } from './components/FinalStandings'
import { LiveStatus } from './components/LiveStatus'
import { MergeAnnouncement } from './components/MergeAnnouncement'
import { RaceBoard } from './components/RaceBoard'
import { EMPTY_TEAMS } from './data/teams'
import { playMergeNotificationAudio, playPresentationAudio } from './lib/audio'
import {
  ACTIVE_PRESENTATION_KEY,
  LATEST_STATE_KEY,
  PRESENTATION_EVENT,
  createBatch,
  getPresentationPhase,
  readSessionValue,
  subtractBatchFromScores,
} from './lib/presentation'
import type { MergeBatch, MergePresentation, MergeRaceState } from './types'
import './App.css'

const EMPTY_STATE: MergeRaceState = {
  events: [],
  github: { connected: false, error: null, nextRetryAt: null, stale: true },
  instanceId: 'waiting-for-server',
  lastSuccessfulPollAt: null,
  latestSequence: 0,
  ok: true,
  serverTime: new Date(0).toISOString(),
  teams: EMPTY_TEAMS,
}

const MANUAL_PRESENTATION_DELAY_MS = 1_150
const MANUAL_PRESENTATION_DURATION_MS = 16_500

type MergeAudioWindow = Window & { __cotatoMergeAudioContext?: AudioContext }

export default function App() {
  const appElement = useRef<HTMLElement>(null)
  const previousSequence = useRef<number | null>(null)
  const manualPresentationStartTimer = useRef<number | null>(null)
  const manualBatchTimer = useRef<number | null>(null)
  const [state, setState] = useState(
    () => readSessionValue<MergeRaceState>(LATEST_STATE_KEY) ?? EMPTY_STATE,
  )
  const [presentation, setPresentation] = useState(
    () => readSessionValue<MergePresentation>(ACTIVE_PRESENTATION_KEY),
  )
  const [manualPresentation, setManualPresentation] = useState<MergePresentation | null>(null)
  const [manualBatch, setManualBatch] = useState<MergeBatch | null>(null)
  const [now, setNow] = useState(Date.now)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundReady, setSoundReady] = useState(
    () => Boolean((window as MergeAudioWindow).__cotatoMergeAudioContext),
  )

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const refreshPresentation = () => {
      setPresentation(readSessionValue<MergePresentation>(ACTIVE_PRESENTATION_KEY))
      setNow(Date.now())
    }
    window.addEventListener(PRESENTATION_EVENT, refreshPresentation)
    window.addEventListener('storage', refreshPresentation)
    return () => {
      window.removeEventListener(PRESENTATION_EVENT, refreshPresentation)
      window.removeEventListener('storage', refreshPresentation)
    }
  }, [])

  useEffect(() => {
    let disposed = false

    const fetchState = async () => {
      try {
        const response = await fetch('/__merge-race/state', { cache: 'no-store' })
        const nextState = await response.json() as MergeRaceState
        if (!response.ok || !nextState.ok || disposed) return

        window.sessionStorage.setItem(LATEST_STATE_KEY, JSON.stringify(nextState))
        setState(nextState)

        if (previousSequence.current === null) {
          previousSequence.current = nextState.latestSequence
          return
        }

        if (!presentation) {
          const newEvents = nextState.events.filter(
            (event) => event.sequence > (previousSequence.current ?? 0),
          )
          if (newEvents.length > 0) {
            const batch = createBatch(newEvents, `manual-${nextState.latestSequence}`)
            setManualBatch(batch)

            if (manualPresentationStartTimer.current) window.clearTimeout(manualPresentationStartTimer.current)
            manualPresentationStartTimer.current = window.setTimeout(() => {
              const scoresBefore = nextState.teams
              const scoresAfter = subtractBatchFromScores(scoresBefore, batch.teamChanges)

              setManualPresentation({
                batch,
                durationMs: MANUAL_PRESENTATION_DURATION_MS,
                mode: 'auto',
                presentationId: `manual-${nextState.latestSequence}`,
                returnPath: window.location.pathname,
                scoresAfter,
                scoresBefore,
                startedAt: Date.now(),
              })
            }, MANUAL_PRESENTATION_DELAY_MS)

            if (manualBatchTimer.current) window.clearTimeout(manualBatchTimer.current)
            manualBatchTimer.current = window.setTimeout(
              () => {
                setManualBatch(null)
                setManualPresentation(null)
              },
              MANUAL_PRESENTATION_DURATION_MS,
            )
          }
        }
        previousSequence.current = nextState.latestSequence
      } catch {
        // Keep the last known scoreboard while the local server retries.
      }
    }

    void fetchState()
    const timer = window.setInterval(() => void fetchState(), 1_000)
    return () => {
      disposed = true
      window.clearInterval(timer)
      if (manualPresentationStartTimer.current) window.clearTimeout(manualPresentationStartTimer.current)
      if (manualBatchTimer.current) window.clearTimeout(manualBatchTimer.current)
    }
  }, [presentation])

  const activePresentation = presentation ?? manualPresentation
  const automatic = activePresentation !== null
  const elapsedMs = activePresentation ? Math.max(0, now - activePresentation.startedAt) : 0
  const phase = getPresentationPhase(elapsedMs, automatic)
  const batch = activePresentation?.batch ?? manualBatch
  const displayTeams = activePresentation
    ? phase === 'detected' || phase === 'announcement'
      ? activePresentation.scoresBefore
      : activePresentation.scoresAfter
    : state.teams
  const remainingSeconds = activePresentation
    ? Math.max(0, Math.ceil((activePresentation.durationMs - elapsedMs) / 1_000))
    : null

  useEffect(() => {
    if (!activePresentation) return
    const stopAudio = playPresentationAudio(Math.max(0, Date.now() - activePresentation.startedAt))
    setSoundReady(stopAudio !== null)
    return () => stopAudio?.()
  }, [activePresentation?.presentationId])

  useEffect(() => {
    if (!manualBatch || activePresentation) return
    const stopAudio = playMergeNotificationAudio()
    setSoundReady(stopAudio !== null)
    return () => stopAudio?.()
  }, [manualBatch?.id, activePresentation])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === appElement.current)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) await document.exitFullscreen()
      else setIsFullscreen(false)
      return
    }

    setIsFullscreen(true)
    try {
      await appElement.current?.requestFullscreen()
    } catch {
      // CSS viewport mode remains active if the browser blocks native fullscreen.
    }
  }

  const enableSound = () => {
    const stopAudio = playPresentationAudio(0)
    setSoundReady(stopAudio !== null)
    window.setTimeout(() => stopAudio?.(), 500)
  }

  return (
    <main
      ref={appElement}
      className={`merge-race merge-race--${phase} ${isFullscreen ? 'merge-race--fullscreen' : ''}`}
    >
      <div className="merge-race__grid" aria-hidden="true" />
      <header className="merge-header">
        <div className="merge-brand">
          <span className="merge-brand__potato" aria-hidden="true"><i /><i /></span>
          <div><strong>COTATO</strong><small>COMMIT RACE · 8TH COKERTHON</small></div>
        </div>
        <div className="merge-header__actions">
          <LiveStatus state={state} />
          <button type="button" onClick={enableSound} aria-label="효과음 테스트 및 활성화">
            {soundReady ? 'SOUND READY' : 'ENABLE SOUND'}
          </button>
          <button type="button" onClick={() => void toggleFullscreen()}>
            {isFullscreen ? '화면 복귀' : '전체화면'}
          </button>
          {remainingSeconds !== null && <strong>{String(remainingSeconds).padStart(2, '0')}s</strong>}
        </div>
      </header>

      <section className="merge-stage">
        <MergeAnnouncement batch={batch} phase={phase} />
        <div className="merge-stage__content">
          <RaceBoard batch={batch} phase={phase} teams={displayTeams} />
          <Leaderboard teams={displayTeams} />
        </div>
      </section>

      <footer className="merge-footer">
        <span>NEXT GITHUB SYNC · 5 SEC</span>
        <span>MERGED PR COMMITS ONLY</span>
        <span>LIVE SYSTEM · 6 TEAMS</span>
      </footer>

      {phase === 'detected' && <div className="merge-flash" aria-hidden="true" />}
      {phase === 'standings' && <FinalStandings teams={displayTeams} />}
    </main>
  )
}
