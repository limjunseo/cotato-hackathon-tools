import { formatPrize } from '../data/awards'
import type { Award } from '../types'
import { PotatoMascot } from './PotatoMascot'

type AwardCardProps = {
  award: Award
  featured?: boolean
}

const RANK_LABELS = {
  1: 'FIRST PLACE',
  2: 'SECOND PLACE',
  3: 'THIRD PLACE',
} as const

export function AwardCard({ award, featured = false }: AwardCardProps) {
  return (
    <article className={`award-card award-card--rank-${award.rank} ${featured ? 'award-card--featured' : ''}`}>
      <div className="award-card__corner" aria-hidden="true">
        <span>{String(award.rank).padStart(2, '0')}</span>
        <i />
      </div>
      <p className="award-card__rank">{RANK_LABELS[award.rank]}</p>
      <PotatoMascot rank={award.rank} compact={!featured} />
      <div className="award-card__copy">
        <h2>{award.teamName}</h2>
        <p>{formatPrize(award.prizeAmount)}</p>
      </div>
      <span className="award-card__serial">COKERTHON · AWARD 00{award.rank}</span>
    </article>
  )
}
