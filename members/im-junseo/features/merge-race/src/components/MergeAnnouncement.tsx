import { buildAnnouncement } from '../lib/presentation'
import type { MergeBatch, PresentationPhase } from '../types'

export function MergeAnnouncement({ batch, phase }: {
  batch: MergeBatch | null
  phase: PresentationPhase
}) {
  if (!batch) {
    return (
      <div className="merge-announcement merge-announcement--manual">
        <span>MANUAL LIVE MODE</span>
        <h1>6 TEAMS<br /><em>MERGE RACE</em></h1>
        <p>GitHub default branch merge를 기다리고 있습니다.</p>
      </div>
    )
  }

  if (phase === 'detected') {
    return (
      <div className="merge-announcement merge-announcement--detected" role="status">
        <span>INCOMING GITHUB SIGNAL</span>
        <h1>MERGE<br /><em>DETECTED</em></h1>
      </div>
    )
  }

  return (
    <div
      className={`merge-announcement merge-announcement--${phase} ${phase === 'manual' ? 'merge-announcement--live' : ''}`}
      role="status"
    >
      <span>{batch.totalMerges} NEW MERGE{batch.totalMerges > 1 ? 'S' : ''}</span>
      <h1>{buildAnnouncement(batch)}</h1>
      <p>
        {batch.teamChanges
          .map((change) => (
            `${change.teamName} +${change.commitCount} COMMIT${change.commitCount === 1 ? '' : 'S'}`
          ))
          .join(' · ')}
      </p>
    </div>
  )
}
