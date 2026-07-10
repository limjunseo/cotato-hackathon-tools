export type MergeRaceScreen = 'timer' | 'roulette' | 'merge-race' | 'other'
export type MergeRaceDecision = 'present-now' | 'queue' | 'show-in-place'

export function getMergeRaceScreen(
  path: string,
  paths: { mergeRace: string; roulette: string; timer: string },
): MergeRaceScreen {
  if (path === paths.timer) return 'timer'
  if (path === paths.roulette) return 'roulette'
  if (path === paths.mergeRace) return 'merge-race'
  return 'other'
}

export function decideMergeRaceAction(screen: MergeRaceScreen, hasActivePresentation: boolean): MergeRaceDecision {
  if (screen === 'timer' && !hasActivePresentation) return 'present-now'
  if (screen === 'merge-race' && !hasActivePresentation) return 'show-in-place'
  return 'queue'
}

export function getPresentationEndAction(pendingEventCount: number) {
  return pendingEventCount > 0 ? 'next-presentation' as const : 'return-timer' as const
}
