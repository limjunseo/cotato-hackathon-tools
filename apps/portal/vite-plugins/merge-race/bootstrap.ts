import type { ValidMerge } from './score-engine'
import type { RuntimeState } from './types'

export function prepareBootstrap(validMerges: ValidMerge[], runtimeState: RuntimeState | null) {
  const previouslySeen = new Set(runtimeState?.seenMergeKeys ?? [])

  return {
    latestSequence: runtimeState?.latestSequence ?? 0,
    notificationMerges: runtimeState
      ? validMerges.filter((merge) => !previouslySeen.has(merge.id))
      : [],
    seenMergeKeys: new Set([
      ...previouslySeen,
      ...validMerges.map((merge) => merge.id),
    ]),
  }
}
