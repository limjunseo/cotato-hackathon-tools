import type { FeatureDefinition } from '@cotato/contracts'
import type { CSSProperties } from 'react'
import './styles.css'

type FeatureCardProps = {
  feature: FeatureDefinition
  onOpen: (feature: FeatureDefinition) => void
}

const STATUS_LABEL = {
  ready: 'READY',
  beta: 'BETA',
  planned: 'PLANNED',
} as const

export function FeatureCard({ feature, onOpen }: FeatureCardProps) {
  return (
    <article
      className="cotato-feature-card"
      style={{ '--feature-accent': feature.accent } as CSSProperties}
    >
      <div className="cotato-feature-card__topline">
        <span className={`cotato-feature-status cotato-feature-status--${feature.status}`}>
          {STATUS_LABEL[feature.status]}
        </span>
        <span className="cotato-feature-owner">{feature.owner.name}</span>
      </div>
      <div className="cotato-feature-meta">
        <span className="cotato-feature-port">
          {feature.devPort ? `PORT ${feature.devPort}` : 'PORT TBD'}
        </span>
      </div>
      <div className="cotato-feature-symbol" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      <button
        type="button"
        onClick={() => onOpen(feature)}
        disabled={feature.status === 'planned'}
      >
        <span>{feature.status === 'planned' ? '준비 중' : '기능 실행'}</span>
        <span aria-hidden="true">↗</span>
      </button>
    </article>
  )
}
