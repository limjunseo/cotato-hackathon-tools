import type { DrawPhase } from '../types'

type ResultTrayProps = {
  expectedCount: number
  phase: DrawPhase
  revealedNumbers: number[]
}

export function ResultTray({ expectedCount, phase, revealedNumbers }: ResultTrayProps) {
  const hasStarted = phase !== 'idle' || revealedNumbers.length > 0

  return (
    <section className="result-card" aria-labelledby="draw-result-title">
      <div className="section-heading section-heading--compact">
        <span>02</span>
        <div>
          <p>LUCKY NUMBERS</p>
          <h2 id="draw-result-title">도착한 감자</h2>
        </div>
        <strong aria-live="polite">
          {revealedNumbers.length}<small> / {hasStarted ? expectedCount : 0}</small>
        </strong>
      </div>

      {!hasStarted ? (
        <div className="empty-results">
          <span aria-hidden="true">?</span>
          <p>핀볼을 시작하면<br />행운 번호가 여기에 도착해요.</p>
        </div>
      ) : (
        <ol className="result-list" aria-label="추첨 순서">
          {Array.from({ length: expectedCount }, (_, index) => {
            const number = revealedNumbers[index]

            return number === undefined ? (
              <li className="result-chip result-chip--waiting" aria-label="도착 대기" key={`slot-${index}`}>
                <span>··</span>
              </li>
            ) : (
              <li className="result-chip" key={number}>
                <small>{String(index + 1).padStart(2, '0')}</small>
                <strong>{number}</strong>
              </li>
            )
          })}
        </ol>
      )}

      <div className={`result-status result-status--${phase}`} aria-live="polite">
        <i aria-hidden="true" />
        {phase === 'idle' && '41명 감자 출발 대기 중'}
        {phase === 'countdown' && '잠시 후 41명이 동시에 출발합니다'}
        {phase === 'running' && `${expectedCount - revealedNumbers.length}자리의 행운 감자가 레이스 중`}
        {phase === 'complete' && `${expectedCount}개 추첨 완료`}
      </div>
    </section>
  )
}
