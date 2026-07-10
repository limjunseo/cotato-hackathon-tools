import type { CSSProperties } from 'react'
import { getRankedTeams } from '../lib/presentation'
import type { TeamScore } from '../types'

export function FinalStandings({ teams }: { teams: TeamScore[] }) {
  return (
    <section className="final-standings" role="status" aria-labelledby="final-standings-title">
      <header>
        <span>BEFORE RETURNING TO TIMER</span>
        <h2 id="final-standings-title">현재 순위</h2>
        <p>깃허브 머지 횟수 기준</p>
      </header>
      <ol>
        {getRankedTeams(teams).map(({ rank, team }) => (
          <li key={team.teamId} style={{ '--standing-color': team.color } as CSSProperties}>
            <span>{String(rank).padStart(2, '0')}위</span>
            <strong>{team.name}</strong>
            <b>{team.total}</b>
            <small>GITHUB MERGES</small>
          </li>
        ))}
      </ol>
    </section>
  )
}
