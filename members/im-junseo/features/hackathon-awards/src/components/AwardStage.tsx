import { getAward } from '../data/awards'
import type { Award, AwardRank, AwardStage as AwardStageName } from '../types'
import { AwardCard } from './AwardCard'
import { CelebrationEffects } from './CelebrationEffects'

type AwardStageProps = {
  awards: Award[]
  stage: AwardStageName
}

const STAGE_DETAILS: Record<Exclude<AwardStageName, 'intro' | 'complete'>, {
  rank: AwardRank
  eyebrow: string
  note: string
}> = {
  third: { rank: 3, eyebrow: 'THE BRONZE POTATO', note: '세 번째 별이 무대에 오릅니다' },
  second: { rank: 2, eyebrow: 'THE SILVER POTATO', note: '끝까지 빛난 여정에 박수를 보냅니다' },
  first: { rank: 1, eyebrow: 'THE GOLDEN POTATO', note: '오늘 가장 높이 빛난 팀입니다' },
}

function IntroStage() {
  return (
    <section className="intro-stage" aria-labelledby="awards-title">
      <div className="intro-stage__orbit" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="intro-stage__seal" aria-hidden="true">
        <span className="intro-stage__leaf">◆</span>
        <strong>8</strong>
        <small>TH</small>
      </div>
      <p className="stage-eyebrow">COTATO · 8TH COKERTHON</p>
      <h1 id="awards-title" aria-label="FINAL AWARDS">FINAL<br /><em>AWARDS</em></h1>
      <p className="intro-stage__message">수상 결과를 발표합니다</p>
      <span className="intro-stage__prompt">PRESS SPACE TO REVEAL <i aria-hidden="true">→</i></span>
    </section>
  )
}

function RevealStage({ awards, stage }: {
  awards: Award[]
  stage: Exclude<AwardStageName, 'intro' | 'complete'>
}) {
  const details = STAGE_DETAILS[stage]
  const award = getAward(awards, details.rank)

  return (
    <section className={`reveal-stage reveal-stage--rank-${details.rank}`} aria-live="polite">
      <CelebrationEffects intensity={details.rank === 1 ? 'full' : 'quiet'} />
      <div className="reveal-stage__heading">
        <p className="stage-eyebrow">{details.eyebrow}</p>
        <span>{details.note}</span>
      </div>
      <AwardCard award={award} featured />
      <div className="reveal-stage__rank" aria-hidden="true">
        <strong>0{details.rank}</strong>
        <span>{details.rank === 1 ? 'CHAMPION' : 'WINNER'}</span>
      </div>
    </section>
  )
}

function CompleteStage({ awards }: { awards: Award[] }) {
  const first = getAward(awards, 1)
  const second = getAward(awards, 2)
  const third = getAward(awards, 3)

  return (
    <section className="complete-stage" aria-labelledby="complete-title">
      <CelebrationEffects intensity="full" />
      <header className="complete-stage__header">
        <p className="stage-eyebrow">THE FINAL RESULT · 2026</p>
        <h1 id="complete-title" aria-label="OUR TOP 3">OUR <em>TOP 3</em></h1>
        <span>모든 수상팀에게 큰 박수를 보냅니다</span>
      </header>
      <div className="complete-stage__cards">
        <AwardCard award={second} />
        <AwardCard award={first} featured />
        <AwardCard award={third} />
      </div>
      <p className="complete-stage__closing">COde Together, Arrive TOgether</p>
    </section>
  )
}

export function AwardStage({ awards, stage }: AwardStageProps) {
  if (stage === 'intro') return <IntroStage />
  if (stage === 'complete') return <CompleteStage awards={awards} />
  return <RevealStage awards={awards} stage={stage} />
}
