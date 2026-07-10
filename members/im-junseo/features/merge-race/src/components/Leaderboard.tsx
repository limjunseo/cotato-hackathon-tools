import type { CSSProperties } from 'react'
import { getRankedTeams } from '../lib/presentation'
import type { TeamScore } from '../types'

export function Leaderboard({ teams }: { teams: TeamScore[] }) {
  return (
    <aside className="merge-leaderboard" aria-labelledby="leaderboard-title">
      <header>
        <span>깃허브 커밋 횟수 · LIVE BOARD</span>
        <h2 id="leaderboard-title">현재 순위</h2>
      </header>
      <ol>
        {getRankedTeams(teams).map(({ rank, team }) => (
          <li key={team.teamId} style={{ '--rank-color': team.color } as CSSProperties}>
            <span>{String(rank).padStart(2, '0')}</span>
            <strong>{team.name}</strong>
            <b>{team.total}</b>
          </li>
        ))}
      </ol>
    </aside>
  )
}
