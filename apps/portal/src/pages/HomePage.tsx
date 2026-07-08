import type { FeatureDefinition } from '@cotato/contracts'
import { FeatureCard } from '@cotato/ui'
import { BrandMark } from '../components/BrandMark'
import { features, members } from '../feature-registry'

export function HomePage({ onOpen }: { onOpen: (feature: FeatureDefinition) => void }) {
  return (
    <main className="portal">
      <div className="portal-grid" aria-hidden="true" />
      <div className="portal-glow portal-glow--blue" aria-hidden="true" />
      <div className="portal-glow portal-glow--orange" aria-hidden="true" />

      <header className="portal-header">
        <div className="portal-brand">
          <BrandMark />
          <strong>COTATO</strong>
          <span />
          <small>HACKATHON TOOLS</small>
        </div>
        <div className="portal-live"><i />LOCAL ORCHESTRATOR</div>
      </header>

      <section className="portal-hero">
        <p className="portal-eyebrow">ONE REPOSITORY · MANY FEATURES</p>
        <h1>함께 만들고,<br /><em>하나에서 실행합니다.</em></h1>
        <p>
          구성원은 자신의 공간에서 독립적으로 개발하고,
          포털은 모든 기능을 하나의 COTATO 경험으로 연결합니다.
        </p>
        <div className="portal-summary">
          <span><strong>{members.length}</strong> CONTRIBUTORS</span>
          <span><strong>{features.length}</strong> ACTIVE FEATURES</span>
          <span><strong>1</strong> ORCHESTRATOR</span>
        </div>
      </section>

      <section className="member-lanes" aria-label="구성원별 기능">
        {members.map((member, memberIndex) => {
          const ownedFeatures = features.filter((feature) => feature.owner.id === member.id)
          return (
            <section className="member-lane" key={member.id}>
              <header className="member-lane__header">
                <span className="member-number">0{memberIndex + 1}</span>
                <div>
                  <h2>{member.name}</h2>
                  <p>{member.role} · {ownedFeatures.length} FEATURES</p>
                </div>
                <i style={{ background: member.accent }} />
              </header>

              <div className="member-features">
                {ownedFeatures.length > 0 ? (
                  ownedFeatures.map((feature) => (
                    <FeatureCard feature={feature} onOpen={onOpen} key={feature.id} />
                  ))
                ) : (
                  <div className="empty-feature">
                    <span>+</span>
                    <strong>새 기능을 준비 중입니다</strong>
                    <p>담당자 폴더의 템플릿으로 첫 기능을 시작할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </section>

      <footer className="portal-footer">
        <span>COde Together, Arrive TOgether</span>
        <span>PNPM WORKSPACE · FEATURE REGISTRY V1</span>
      </footer>
    </main>
  )
}
