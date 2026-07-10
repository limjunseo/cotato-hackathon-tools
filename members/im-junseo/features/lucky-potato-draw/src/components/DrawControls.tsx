import { useState } from 'react'
import type { DrawPhase } from '../types'
import { MAX_DRAW_NUMBER, MIN_DRAW_NUMBER, normalizeDrawCount } from '../lib/draw'

const PRESET_COUNTS = [1, 3, 5, 7, 10, 20, 41]

type DrawControlsProps = {
  count: number
  excludedNumbers: number[]
  maxCount: number
  phase: DrawPhase
  onAddExcluded: (numbers: number[]) => void
  onClearExcluded: () => void
  onCountChange: (count: number) => void
  onRemoveExcluded: (number: number) => void
  onStart: () => void
}

export function DrawControls({
  count,
  excludedNumbers,
  maxCount,
  phase,
  onAddExcluded,
  onClearExcluded,
  onCountChange,
  onRemoveExcluded,
  onStart,
}: DrawControlsProps) {
  const [excludeInput, setExcludeInput] = useState('')
  const [excludeError, setExcludeError] = useState('')
  const isLocked = phase === 'countdown' || phase === 'running'
  const buttonLabel = phase === 'complete' ? '다시 레이스하기' : `${maxCount}명 출발시키기`
  const activeLabel = phase === 'countdown' ? '출발 준비 중...' : '감자 레이스 중...'

  const addExcluded = () => {
    const tokens = excludeInput.trim().split(/[\s,]+/).filter(Boolean)
    const numbers = tokens.map(Number)
    const hasInvalidNumber = numbers.some((number) => (
      !Number.isInteger(number) || number < MIN_DRAW_NUMBER || number > MAX_DRAW_NUMBER
    ))

    if (tokens.length === 0 || hasInvalidNumber) {
      setExcludeError('1부터 41까지의 번호만 입력해 주세요.')
      return
    }

    onAddExcluded(numbers)
    setExcludeInput('')
    setExcludeError('')
  }

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
            max={maxCount}
            value={count}
            disabled={isLocked}
            aria-label="추첨 개수 직접 입력"
            onChange={(event) => onCountChange(
              Math.min(maxCount, normalizeDrawCount(Number(event.target.value))),
            )}
          />
          <small>개</small>
        </label>
      </div>

      <input
        className="count-slider"
        type="range"
        min={MIN_DRAW_NUMBER}
        max={maxCount}
        value={count}
        disabled={isLocked}
        aria-label="추첨 개수 슬라이더"
        onChange={(event) => onCountChange(Number(event.target.value))}
      />

      <div className="range-labels" aria-hidden="true">
        <span>01</span>
        <span>{String(maxCount).padStart(2, '0')}</span>
      </div>

      <div className="preset-list" aria-label="빠른 개수 선택">
        {PRESET_COUNTS.map((preset) => (
          <button
            type="button"
            className={count === preset ? 'is-selected' : ''}
            disabled={isLocked || preset > maxCount}
            aria-pressed={count === preset}
            onClick={() => onCountChange(preset)}
            key={preset}
          >
            {preset}
          </button>
        ))}
      </div>

      <section className="exclude-control" aria-labelledby="exclude-control-title">
        <div className="exclude-control__heading">
          <div>
            <span>EXCLUDE</span>
            <strong id="exclude-control-title">특정 번호 제외</strong>
          </div>
          <small>{excludedNumbers.length}명 제외 · {maxCount}명 참가</small>
        </div>

        <div className="exclude-control__input">
          <input
            type="text"
            value={excludeInput}
            disabled={isLocked || maxCount === 1}
            placeholder="예: 3, 8, 21"
            aria-label="제외할 번호 입력"
            aria-describedby="exclude-help exclude-error"
            onChange={(event) => setExcludeInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addExcluded()
              }
            }}
          />
          <button
            type="button"
            disabled={isLocked || maxCount === 1}
            onClick={addExcluded}
          >
            제외 추가
          </button>
        </div>
        <p id="exclude-help">쉼표 또는 띄어쓰기로 여러 번호를 입력할 수 있어요.</p>
        <p className="exclude-control__error" id="exclude-error" aria-live="polite">
          {excludeError}
        </p>

        {excludedNumbers.length > 0 && (
          <div className="excluded-numbers">
            <div>
              {excludedNumbers.map((number) => (
                <button
                  type="button"
                  disabled={isLocked}
                  aria-label={`${number}번 제외 취소`}
                  onClick={() => onRemoveExcluded(number)}
                  key={number}
                >
                  #{number}<span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <button type="button" disabled={isLocked} onClick={onClearExcluded}>전체 초기화</button>
          </div>
        )}
      </section>

      <button className="draw-button" type="button" disabled={isLocked} onClick={onStart}>
        <span className="draw-button__icon" aria-hidden="true">◆</span>
        <span>{isLocked ? activeLabel : buttonLabel}</span>
        <span aria-hidden="true">→</span>
      </button>

      <p className="security-note">
        <i aria-hidden="true" />
        {maxCount}명 동시 출발 · 먼저 도착한 순서로 당첨
      </p>
    </section>
  )
}
