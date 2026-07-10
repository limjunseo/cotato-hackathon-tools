import type { CSSProperties } from 'react'
import { getTeamChange } from '../lib/presentation'
import type { MergeBatch, PresentationPhase, TeamScore } from '../types'
import { PotatoRacer } from './PotatoRacer'

type RaceBoardProps = {
  batch: MergeBatch | null
  phase: PresentationPhase
  teams: TeamScore[]
}

type LaneStyle = CSSProperties & {
  '--camera-x': string
  '--distance-x': string
  '--team-color': string
}

export function RaceBoard({ batch, phase, teams }: RaceBoardProps) {
  const leaderDistance = Math.max(0, ...teams.map((team) => team.total * 74))
  const cameraOffset = Math.max(0, leaderDistance - 590)

  return (
    <section className={`race-board race-board--${phase}`} aria-label="6개 팀 Merge Race">
      <header className="race-board__header">
        <span>TEAM LANES · FIXED ORDER</span>
        <span>1 MERGE = 1 BOOST UNIT</span>
      </header>

      <div className="race-lanes">
        {teams.map((team) => {
          const boost = getTeamChange(batch, team.teamId)
          const style: LaneStyle = {
            '--camera-x': `${cameraOffset}px`,
            '--distance-x': `${team.total * 74}px`,
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
                <span>깃허브 머지 횟수</span>
                <small>C {team.client} · S {team.server}</small>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
