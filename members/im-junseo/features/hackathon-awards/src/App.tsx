import { useCallback, useEffect, useRef, useState } from 'react'
import { AwardSettingsDialog } from './components/AwardSettingsDialog'
import { AwardStage } from './components/AwardStage'
import { FullscreenButton } from './components/FullscreenButton'
import { readAwards, saveAwards } from './data/awards'
import { AWARD_STAGES, getStageNumber, moveStage } from './lib/stages'
import type { Award, AwardStage as AwardStageName } from './types'
import './App.css'

const RESET_HOLD_MS = 900

export default function App() {
  const appElement = useRef<HTMLElement>(null)
  const resetTimer = useRef<number | null>(null)
  const [awards, setAwards] = useState(readAwards)
  const [stage, setStage] = useState<AwardStageName>('intro')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isResetArmed, setIsResetArmed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const stageNumber = getStageNumber(stage)

  const clearReset = useCallback(() => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
    setIsResetArmed(false)
  }, [])

  const startReset = useCallback(() => {
    if (stage === 'intro' || resetTimer.current !== null) return
    setIsResetArmed(true)
    resetTimer.current = window.setTimeout(() => {
      setStage('intro')
      setIsResetArmed(false)
      resetTimer.current = null
    }, RESET_HOLD_MS)
  }, [stage])

  const goNext = useCallback(() => setStage((current) => moveStage(current, 1)), [])
  const goPrevious = useCallback(() => setStage((current) => moveStage(current, -1)), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSettingsOpen) {
        if (event.key === 'Escape') setIsSettingsOpen(false)
        return
      }

      const target = event.target
      if ((target instanceof Element && target.closest('button, input, textarea, select, a')) || event.repeat) return

      if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrevious()
      } else if (event.key.toLowerCase() === 'r') {
        startReset()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') clearReset()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    }
  }, [clearReset, goNext, goPrevious, isSettingsOpen, startReset])

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === appElement.current)
    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    try {
      await appElement.current?.requestFullscreen()
    } catch {
      setIsFullscreen((current) => !current)
    }
  }

  const updateAwards = (nextAwards: Award[]) => {
    setAwards(nextAwards)
    saveAwards(nextAwards)
    setIsSettingsOpen(false)
  }

  return (
    <main
      ref={appElement}
      className={`awards-app awards-app--${stage} ${isFullscreen ? 'awards-app--fullscreen' : ''}`}
    >
      <div className="awards-app__grid" aria-hidden="true" />
      <div className="awards-app__glow" aria-hidden="true" />

      <header className="awards-header">
        <div className="awards-brand">
          <span className="awards-brand__potato" aria-hidden="true"><i /><i /></span>
          <div>
            <strong>COTATO AWARDS</strong>
            <small>8TH COKERTHON · FINAL CEREMONY</small>
          </div>
        </div>

        <div className="awards-header__actions">
          <span className="awards-header__live"><i /> LIVE STAGE</span>
          {stage === 'intro' && (
            <button
              className="awards-utility-button awards-settings-button"
              type="button"
              aria-label="수상 정보 설정"
              onClick={() => setIsSettingsOpen(true)}
            >
              <span aria-hidden="true">⚙</span>
              AWARD SETUP
            </button>
          )}
          <FullscreenButton isFullscreen={isFullscreen} onToggle={() => void toggleFullscreen()} />
        </div>
      </header>

      <div className="awards-viewport" key={stage}>
        <AwardStage awards={awards} stage={stage} />
      </div>

      <footer className="awards-controls">
        <div className="awards-controls__progress" aria-label={`발표 ${stageNumber + 1} / ${AWARD_STAGES.length} 단계`}>
          <span>{String(stageNumber + 1).padStart(2, '0')}</span>
          <div>
            {AWARD_STAGES.map((item, index) => (
              <i key={item} className={index <= stageNumber ? 'is-active' : ''} />
            ))}
          </div>
          <span>{String(AWARD_STAGES.length).padStart(2, '0')}</span>
        </div>

        <div className="awards-controls__buttons">
          <button type="button" disabled={stage === 'intro'} onClick={goPrevious}>
            <span aria-hidden="true">←</span> PREV
          </button>
          <button
            className="awards-controls__next"
            type="button"
            disabled={stage === 'complete'}
            onClick={goNext}
          >
            {stage === 'intro' ? '결과 공개' : '다음 단계'} <span aria-hidden="true">→</span>
          </button>
        </div>

        <p className="awards-controls__keys">
          <span>SPACE</span> NEXT
          <i />
          <span>← →</span> NAVIGATE
          <i />
          <span>R HOLD</span> RESET
        </p>
      </footer>

      {isResetArmed && (
        <div className="reset-notice" role="status">
          <span><i /></span>
          R을 계속 누르면 처음으로 돌아갑니다
        </div>
      )}

      {isSettingsOpen && (
        <AwardSettingsDialog
          awards={awards}
          onClose={() => setIsSettingsOpen(false)}
          onSave={updateAwards}
        />
      )}
    </main>
  )
}
