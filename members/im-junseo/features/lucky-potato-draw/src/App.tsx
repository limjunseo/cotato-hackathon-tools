import { useEffect, useMemo, useRef, useState } from 'react'
import { DrawControls } from './components/DrawControls'
import { PinballBoard } from './components/PinballBoard'
import { ResultTray } from './components/ResultTray'
import { WinnerCelebration } from './components/WinnerCelebration'
import { DEFAULT_DRAW_COUNT, MAX_DRAW_NUMBER, drawUniqueNumbers } from './lib/draw'
import { COUNTDOWN_DURATION_MS } from './lib/pinball'
import { playRaceMusic } from './lib/raceMusic'
import type { RaceMusicSession } from './lib/raceMusic'
import type { DrawPhase } from './types'
import './App.css'

const ALL_PARTICIPANTS = Array.from({ length: MAX_DRAW_NUMBER }, (_, index) => index + 1)

const PHASE_COPY = {
  idle: ['41 POTATOES READY', '1번부터 41번까지, 모든 감자가 출발선에 모였습니다.'],
  countdown: ['READY TO RACE', '3, 2, 1... 땅! 모두 함께 출발합니다.'],
  running: ['POTATO RACE', '41명의 감자 중 가장 먼저 도착할 행운의 감자는?'],
  complete: ['LUCKY POTATOES', '당첨 감자 뒤로 모든 감자가 골인했습니다.'],
} as const

export default function App() {
  const appElement = useRef<HTMLElement>(null)
  const musicSession = useRef<RaceMusicSession | null>(null)
  const [count, setCount] = useState(DEFAULT_DRAW_COUNT)
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [raceOrder, setRaceOrder] = useState<number[]>([])
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([])
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const [showWinners, setShowWinners] = useState(false)
  const [runId, setRunId] = useState(0)
  const participants = useMemo(
    () => ALL_PARTICIPANTS.filter((number) => !excludedNumbers.includes(number)),
    [excludedNumbers],
  )

  useEffect(() => {
    if (phase !== 'countdown') {
      return
    }

    const timer = window.setTimeout(() => setPhase('running'), COUNTDOWN_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [phase, runId])

  useEffect(() => {
    setCount((current) => Math.min(current, participants.length))
  }, [participants.length])

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === appElement.current)
    document.addEventListener('fullscreenchange', syncFullscreenState)

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
      musicSession.current?.stop()
    }
  }, [])

  const stopMusic = () => {
    musicSession.current?.stop()
    musicSession.current = null
  }

  const startMusic = () => {
    stopMusic()
    if (isMusicEnabled) {
      musicSession.current = playRaceMusic()
    }
  }

  const startDraw = () => {
    if (phase === 'countdown' || phase === 'running') {
      return
    }

    setRaceOrder(
      drawUniqueNumbers(MAX_DRAW_NUMBER).filter((number) => participants.includes(number)),
    )
    setRevealedNumbers([])
    setShowWinners(false)
    setPhase('countdown')
    setRunId((current) => current + 1)
    startMusic()
  }

  const revealNumber = (number: number) => {
    setRevealedNumbers((current) => current.includes(number) ? current : [...current, number])
  }

  const addExcludedNumbers = (numbers: number[]) => {
    setExcludedNumbers((current) => (
      [...new Set([...current, ...numbers])]
        .sort((first, second) => first - second)
        .slice(0, MAX_DRAW_NUMBER - 1)
    ))
  }

  const completeRace = () => {
    stopMusic()
    setPhase('complete')
    setShowWinners(true)
  }

  const toggleMusic = () => {
    const nextMusicState = !isMusicEnabled
    setIsMusicEnabled(nextMusicState)

    if (!nextMusicState) {
      stopMusic()
    } else if (phase === 'countdown' || phase === 'running') {
      musicSession.current = playRaceMusic()
    }
  }

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        setIsFullscreen(false)
      }
      return
    }

    setIsFullscreen(true)
    try {
      await appElement.current?.requestFullscreen()
    } catch {
      // The fixed viewport mode remains active when the browser blocks Fullscreen API access.
    }
  }

  return (
    <main
      ref={appElement}
      className={`lucky-potato-app lucky-potato-app--${phase} ${isFullscreen ? 'lucky-potato-app--fullscreen' : ''}`}
    >
      <div className="pixel-noise" aria-hidden="true" />

      <header className="potato-header">
        <div className="potato-brand">
          <span className="potato-brand__mark" aria-hidden="true"><i /><i /></span>
          <div>
            <strong>COTATO</strong>
            <small>LUCKY ARCADE · 2026</small>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-status">
            <i aria-hidden="true" />
            <span>{phase === 'idle' ? `${participants.length} POTATOES READY` : PHASE_COPY[phase][0]}</span>
          </div>
          <button
            className={`utility-button ${isMusicEnabled ? 'is-active' : ''}`}
            type="button"
            aria-label={isMusicEnabled ? 'BGM 끄기' : 'BGM 켜기'}
            aria-pressed={isMusicEnabled}
            onClick={toggleMusic}
          >
            <span aria-hidden="true">♪</span>
            BGM {isMusicEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            className="utility-button"
            type="button"
            aria-label={isFullscreen ? '전체화면 종료' : '전체화면으로 보기'}
            onClick={() => void toggleFullscreen()}
          >
            <span aria-hidden="true">▣</span>
            {isFullscreen ? '화면 복귀' : '전체화면'}
          </button>
        </div>
      </header>

      <section className="potato-intro">
        <div>
          <p className="intro-kicker">LUCK IS ABOUT TO DROP</p>
          <h1>행운의 감자<br /><em>추첨소</em></h1>
        </div>
        <p className="intro-description">
          {phase === 'idle' && excludedNumbers.length > 0
            ? `${excludedNumbers.length}개 번호를 제외하고 ${participants.length}명이 출발을 기다립니다.`
            : PHASE_COPY[phase][1]}
        </p>
        <dl className="draw-rules" aria-label="추첨 규칙">
          <div><dt>RANGE</dt><dd>01—41</dd></div>
          <div><dt>REPEAT</dt><dd>NONE</dd></div>
          <div><dt>ENGINE</dt><dd>CRYPTO</dd></div>
        </dl>
      </section>

      <div className="potato-workspace">
        <PinballBoard
          finishOrder={raceOrder}
          participants={participants}
          phase={phase}
          runId={runId}
          winnerCount={count}
          onNumberLanded={revealNumber}
          onComplete={completeRace}
        />

        <aside className="draw-sidebar">
          <DrawControls
            count={count}
            excludedNumbers={excludedNumbers}
            maxCount={participants.length}
            phase={phase}
            onAddExcluded={addExcludedNumbers}
            onClearExcluded={() => setExcludedNumbers([])}
            onCountChange={setCount}
            onRemoveExcluded={(number) => (
              setExcludedNumbers((current) => current.filter((item) => item !== number))
            )}
            onStart={startDraw}
          />
          <ResultTray
            expectedCount={count}
            participantCount={participants.length}
            phase={phase}
            revealedNumbers={revealedNumbers}
          />
        </aside>
      </div>

      <footer className="potato-footer">
        <span>COde Together, Arrive TOgether</span>
        <span>RESULTS ARE GENERATED LOCALLY IN YOUR BROWSER</span>
      </footer>

      {showWinners && (
        <WinnerCelebration
          participants={participants}
          winners={revealedNumbers}
          onClose={() => setShowWinners(false)}
        />
      )}
    </main>
  )
}
