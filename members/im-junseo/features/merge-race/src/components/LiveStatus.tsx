import type { MergeRaceState } from '../types'

export function LiveStatus({ state }: { state: MergeRaceState }) {
  const label = state.github.connected
    ? state.github.stale ? 'SYNC DELAYED' : 'LIVE'
    : 'GITHUB DISCONNECTED'

  return (
    <div className={`merge-live merge-live--${state.github.connected ? state.github.stale ? 'delayed' : 'ready' : 'offline'}`}>
      <i />
      <span>{label}</span>
    </div>
  )
}
