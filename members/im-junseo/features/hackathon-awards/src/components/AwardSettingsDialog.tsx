import { useState } from 'react'
import { formatPrize } from '../data/awards'
import type { Award } from '../types'

type AwardSettingsDialogProps = {
  awards: Award[]
  onClose: () => void
  onSave: (awards: Award[]) => void
}

const RANK_NAMES = {
  1: '금메달 · 1등',
  2: '은메달 · 2등',
  3: '동메달 · 3등',
} as const

export function AwardSettingsDialog({ awards, onClose, onSave }: AwardSettingsDialogProps) {
  const [draft, setDraft] = useState(() => awards.map((award) => ({ ...award })))

  const updateAward = (rank: Award['rank'], update: Partial<Pick<Award, 'teamName' | 'prizeAmount'>>) => {
    setDraft((current) => current.map((award) => (
      award.rank === rank ? { ...award, ...update } : award
    )))
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave(draft.map((award) => ({
      ...award,
      teamName: award.teamName.trim() || `${award.rank}등 팀`,
      prizeAmount: Math.max(0, Math.round(award.prizeAmount || 0)),
    })))
  }

  return (
    <section
      className="award-settings"
      role="dialog"
      aria-modal="true"
      aria-labelledby="award-settings-title"
    >
      <div className="award-settings__backdrop" aria-hidden="true" onClick={onClose} />
      <form className="award-settings__panel" onSubmit={submit}>
        <header className="award-settings__header">
          <div>
            <p>BEFORE THE CEREMONY</p>
            <h2 id="award-settings-title">수상 정보 설정</h2>
            <span>발표 전에 팀명과 상금을 확인하세요.</span>
          </div>
          <button type="button" aria-label="설정 닫기" onClick={onClose}>×</button>
        </header>

        <div className="award-settings__list">
          {draft.map((award) => (
            <fieldset key={award.rank} className={`award-settings__rank award-settings__rank--${award.rank}`}>
              <legend>{RANK_NAMES[award.rank]}</legend>
              <label>
                <span>팀 이름</span>
                <input
                  type="text"
                  value={award.teamName}
                  maxLength={30}
                  aria-label={`${award.rank}등 팀 이름`}
                  onChange={(event) => updateAward(award.rank, { teamName: event.target.value })}
                />
              </label>
              <label>
                <span>상금</span>
                <div className="award-settings__prize">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={award.prizeAmount}
                    aria-label={`${award.rank}등 상금`}
                    onChange={(event) => updateAward(award.rank, { prizeAmount: Number(event.target.value) })}
                  />
                  <small>{formatPrize(award.prizeAmount || 0)}</small>
                </div>
              </label>
            </fieldset>
          ))}
        </div>

        <footer className="award-settings__footer">
          <p><i /> 저장한 정보는 이 브라우저에서 유지됩니다.</p>
          <div>
            <button type="button" onClick={onClose}>취소</button>
            <button className="award-settings__save" type="submit">설정 저장</button>
          </div>
        </footer>
      </form>
    </section>
  )
}
