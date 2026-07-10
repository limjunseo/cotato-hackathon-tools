import type { CSSProperties } from 'react'
import { getRaceProgress, getTeamChange } from '../lib/presentation'
import type { MergeBatch, PresentationPhase, TeamScore } from '../types'
import { PotatoRacer } from './PotatoRacer'

type RaceBoardProps = {
  batch: MergeBatch | null
  phase: PresentationPhase
  teams: TeamScore[]
}

type LaneStyle = CSSProperties & {
  '--distance-x': string
  '--team-color': string
}

export function RaceBoard({ batch, phase, teams }: RaceBoardProps) {
  return (
    <section className={`race-board race-board--${phase}`} aria-label="6개 팀 Commit Race">
      <header className="race-board__header">
        <span>TEAM LANES · FIXED ORDER</span>
        <span>1 COMMIT = 1 BOOST UNIT</span>
      </header>

      <div className="race-lanes">
        {teams.map((team) => {
          const boost = getTeamChange(batch, team.teamId)
          const style: LaneStyle = {
            '--distance-x': `${getRaceProgress(team.total).toFixed(2)}%`,
            '--team-color': team.color,
          }

          return (
            <article
              className={`race-lane ${boost > 0 ? 'race-lane--boosted' : ''}`}
              style={style}
              key={team.teamId}
            >
              <div className="race-lane__identity">
                <small>TEAM {String(team.teamId).padStart(2, '0')}</small>
                <strong>{team.name}</strong>
              </div>

              <div className="race-track">
                <div className="race-track__world">
                  <span className="race-start">START</span>
                  <PotatoRacer teamId={team.teamId} teamName={team.name} />
                  {boost > 0 && (
                    <span className="race-boost" aria-label={`${boost}점 상승`}>
                      +{boost} BOOST
                    </span>
                  )}
                </div>
              </div>

              <div className="race-lane__score">
                <strong>{String(team.total).padStart(2, '0')}</strong>
                <span>깃허브 커밋 횟수</span>
                <small>C {team.client} · S {team.server}</small>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
