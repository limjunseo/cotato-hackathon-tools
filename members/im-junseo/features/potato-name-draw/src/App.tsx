import { useEffect, useMemo, useRef, useState } from 'react'
import { Potato } from './components/Potato'
import { PotatoArena } from './components/PotatoArena'
import { playLockSound, playRevealSound, playShuffleMusic } from './lib/audio'
import type { MusicSession } from './lib/audio'
import { createParticipants, drawTwoParticipants, parseNames, validateNames } from './lib/draw'
import type { DrawPhase, Participant } from './types'
import './App.css'

const PHASE_STATUS: Record<DrawPhase, string> = {
  input: 'INPUT',
  ready: 'READY',
  shuffling: 'SHUFFLING',
  locking: 'LOCKING',
  'reveal-first': 'REVEAL',
  'reveal-second': 'REVEAL',
  complete: 'COMPLETE',
}

const DRAW_STAGES = new Set<DrawPhase>([
  'shuffling',
  'locking',
  'reveal-first',
  'reveal-second',
  'complete',
])

export default function App() {
  const appElement = useRef<HTMLElement>(null)
  const musicSession = useRef<MusicSession | null>(null)
  const [phase, setPhase] = useState<DrawPhase>('input')
  const [nameInput, setNameInput] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [winners, setWinners] = useState<[Participant, Participant] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const parsedNames = useMemo(() => parseNames(nameInput), [nameInput])
  const debugEnabled = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1',
    [],
  )

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === appElement.current)
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      musicSession.current?.stop()
    }
  }, [])

  useEffect(() => {
    const nextPhase = phase === 'locking'
      ? 'reveal-first'
      : phase === 'reveal-first'
        ? 'reveal-second'
        : phase === 'reveal-second'
          ? 'complete'
          : null

    if (!nextPhase) return
    const timer = window.setTimeout(() => setPhase(nextPhase), 1700)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase === 'reveal-first') playRevealSound()
    if (phase === 'reveal-second') playRevealSound(true)
  }, [phase])

  useEffect(() => {
    if (phase === 'shuffling') {
      appElement.current?.scrollIntoView?.({ block: 'start' })
    }
  }, [phase])

  const stopMusic = () => {
    musicSession.current?.stop()
    musicSession.current = null
  }

  const prepareDraw = () => {
    const validationError = validateNames(parsedNames)
    setError(validationError)
    if (validationError) return
    setParticipants(createParticipants(parsedNames))
    setPhase('ready')
  }

  const startShuffling = () => {
    setWinners(null)
    setPhase('shuffling')
    stopMusic()
    if (isMusicEnabled) musicSession.current = playShuffleMusic()
  }

  const lockWinners = () => {
    if (phase !== 'shuffling') return
    setWinners(drawTwoParticipants(participants))
    setPhase('locking')
    stopMusic()
    playLockSound()
  }

  const toggleMusic = () => {
    const enabled = !isMusicEnabled
    setIsMusicEnabled(enabled)
    if (!enabled) stopMusic()
    else if (phase === 'shuffling') musicSession.current = playShuffleMusic()
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    try {
      await appElement.current?.requestFullscreen()
    } catch {
      setIsFullscreen(false)
    }
  }

  const reset = () => {
    stopMusic()
    setPhase('input')
    setWinners(null)
    setParticipants([])
    setError(null)
  }

  const winnerIds = winners?.map(({ id }) => id) ?? []
  const isDrawStage = DRAW_STAGES.has(phase)
  const liveResult = phase === 'reveal-first'
    ? `${winners?.[0].name ?? ''} 님이 행운의 감자로 선정되었습니다.`
    : phase === 'reveal-second' || phase === 'complete'
      ? `${winners?.map(({ name }) => name).join(', ') ?? ''} 님이 오늘의 행운의 감자입니다.`
      : ''

  return (
    <main
      ref={appElement}
      className={`pnd-app pnd-app--${phase} ${isFullscreen ? 'pnd-app--fullscreen' : ''}`}
    >
      <div className="pnd-noise" aria-hidden="true" />
      <header className="pnd-header">
        <div className="pnd-brand">
          <span className="pnd-brand__mark" aria-hidden="true">C</span>
          <div><strong>COTATO</strong><small>LUCKY POTATO PICK</small></div>
        </div>
        <div className="pnd-header__actions">
          <span className={`pnd-status pnd-status--${phase}`}><i />{PHASE_STATUS[phase]}</span>
          <button type="button" className="pnd-utility" aria-pressed={isMusicEnabled} onClick={toggleMusic}>
            ♪ BGM {isMusicEnabled ? 'ON' : 'OFF'}
          </button>
          <button type="button" className="pnd-utility" onClick={() => void toggleFullscreen()}>
            ⛶ {isFullscreen ? '화면 복귀' : '전체화면'}
          </button>
        </div>
      </header>

      {!isDrawStage && (
        <section className="pnd-setup">
          <p className="pnd-eyebrow">TWO NAMES. ONE LUCKY MOMENT.</p>
          <h1>오늘의 행운의<br /><em>감자 2명</em></h1>

          {phase === 'input' ? (
            <form className="pnd-input-card" onSubmit={(event) => { event.preventDefault(); prepareDraw() }}>
              <div className="pnd-card-label"><span>01</span><strong>참가자 이름 입력</strong></div>
              <label htmlFor="potato-names">이름을 쉼표(,)로 구분해 입력하세요.</label>
              <textarea
                id="potato-names"
                value={nameInput}
                placeholder="김철수, 이영희, 박감자, 최코딩"
                aria-describedby="participant-count input-error"
                aria-invalid={Boolean(error)}
                onChange={(event) => { setNameInput(event.target.value); setError(null) }}
              />
              <div className="pnd-input-meta">
                <span id="participant-count"><strong>{parsedNames.length}</strong> / 12 POTATOES</span>
                <span>당첨 인원 <strong>2명</strong></span>
              </div>
              <p id="input-error" className="pnd-error" role="alert">{error ?? '2명부터 12명까지 참여할 수 있어요.'}</p>
              <button type="submit" className="pnd-primary">추첨 준비 <span aria-hidden="true">→</span></button>
            </form>
          ) : (
            <div className="pnd-ready-card">
              <div className="pnd-ready-heading">
                <div><span>ALL CHECKED</span><h2>{participants.length} POTATOES ARE READY!</h2></div>
                <p>오타와 누락이 없는지 마지막으로 확인해주세요.</p>
              </div>
              <ul className="pnd-ready-list">
                {participants.map((participant) => (
                  <li key={participant.id}><Potato name={participant.name} compact /></li>
                ))}
              </ul>
              <div className="pnd-ready-actions">
                <button type="button" className="pnd-secondary" onClick={() => setPhase('input')}>이름 수정</button>
                <button type="button" className="pnd-primary" onClick={startShuffling}>추첨 시작 <span aria-hidden="true">→</span></button>
              </div>
            </div>
          )}
        </section>
      )}

      {isDrawStage && (
        <section className="pnd-draw-stage" aria-label="이름 추첨 무대">
          <PotatoArena participants={participants} phase={phase} winnerIds={winnerIds} />
          <div className="pnd-stage-copy">
            {phase === 'shuffling' && <><span>THE POTATOES ARE MOVING</span><h1>행운을 잡을 준비가 됐나요?</h1></>}
            {phase === 'locking' && <><span>RESULT LOCKED</span><h1>행운의 감자를 찾는 중...</h1></>}
            {phase === 'reveal-first' && <><span>LUCKY POTATO REVEALED</span><h1>한 명의 감자가 공개됐어요!</h1></>}
            {phase === 'reveal-second' && <><span>ONE MORE LUCKY POTATO</span><h1>오늘의 행운이 모두 모였습니다</h1></>}
            {phase === 'complete' && <><span>DRAW COMPLETE</span><h1>LUCKY POTATOES</h1><p>오늘의 행운의 감자 2명!</p></>}
          </div>
          {phase === 'shuffling' && (
            <button type="button" className="pnd-draw-button" onClick={lockWinners}>
              <span aria-hidden="true">✦</span><strong>뽑기!</strong><small>CLICK TO LOCK</small>
            </button>
          )}
          {phase === 'locking' && <div className="pnd-lock-pulse" aria-hidden="true"><i /><i /><i /></div>}
          {(phase === 'reveal-second' || phase === 'complete') && (
            <div className="pnd-confetti" aria-hidden="true">
              {Array.from({ length: 28 }, (_, index) => <i key={index} />)}
            </div>
          )}
          <p className="pnd-live-result" aria-live="assertive">{liveResult}</p>
        </section>
      )}

      {debugEnabled && phase !== 'input' && (
        <button type="button" className="pnd-debug-reset" onClick={reset}>RESET</button>
      )}

      <footer className="pnd-footer">
        <span>COde Together, Arrive TOgether</span>
        <span>CRYPTOGRAPHICALLY DRAWN IN YOUR BROWSER</span>
      </footer>
    </main>
  )
}
