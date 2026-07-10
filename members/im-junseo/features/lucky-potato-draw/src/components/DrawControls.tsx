import type { DrawPhase } from '../types'
import { MAX_DRAW_NUMBER, MIN_DRAW_NUMBER, normalizeDrawCount } from '../lib/draw'

const PRESET_COUNTS = [1, 3, 5, 7, 10, 20, 41]

type DrawControlsProps = {
  count: number
  phase: DrawPhase
  onCountChange: (count: number) => void
  onStart: () => void
}

export function DrawControls({ count, phase, onCountChange, onStart }: DrawControlsProps) {
  const isLocked = phase === 'countdown' || phase === 'running'
  const buttonLabel = phase === 'complete' ? '다시 레이스하기' : '41명 출발시키기'
  const activeLabel = phase === 'countdown' ? '출발 준비 중...' : '감자 레이스 중...'

  return (
    <section className="control-card" aria-labelledby="draw-control-title">
      <div className="section-heading">
        <span>01</span>
        <div>
          <p>SELECT POTATOES</p>
          <h2 id="draw-control-title">몇 개를 뽑을까요?</h2>
        </div>
      </div>

      <div className="count-display">
        <span>COUNT</span>
        <label>
          <input
            type="number"
            min={MIN_DRAW_NUMBER}
            max={MAX_DRAW_NUMBER}
            value={count}
            disabled={isLocked}
            aria-label="추첨 개수 직접 입력"
            onChange={(event) => onCountChange(normalizeDrawCount(Number(event.target.value)))}
          />
          <small>개</small>
        </label>
      </div>

      <input
        className="count-slider"
        type="range"
        min={MIN_DRAW_NUMBER}
        max={MAX_DRAW_NUMBER}
        value={count}
        disabled={isLocked}
        aria-label="추첨 개수 슬라이더"
        onChange={(event) => onCountChange(Number(event.target.value))}
      />

      <div className="range-labels" aria-hidden="true">
        <span>01</span>
        <span>41</span>
      </div>

      <div className="preset-list" aria-label="빠른 개수 선택">
        {PRESET_COUNTS.map((preset) => (
          <button
            type="button"
            className={count === preset ? 'is-selected' : ''}
            disabled={isLocked}
            aria-pressed={count === preset}
            onClick={() => onCountChange(preset)}
            key={preset}
          >
            {preset}
          </button>
        ))}
      </div>

      <button className="draw-button" type="button" disabled={isLocked} onClick={onStart}>
        <span className="draw-button__icon" aria-hidden="true">◆</span>
        <span>{isLocked ? activeLabel : buttonLabel}</span>
        <span aria-hidden="true">→</span>
      </button>

      <p className="security-note">
        <i aria-hidden="true" />
        41명 동시 출발 · 먼저 도착한 순서로 당첨
      </p>
    </section>
  )
}
