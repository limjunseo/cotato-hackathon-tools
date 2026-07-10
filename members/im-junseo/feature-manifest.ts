import type { FeatureDefinition } from '@cotato/contracts'
import { hackathonTimerFeature } from '@cotato/hackathon-timer/manifest'
import { luckyPotatoDrawFeature } from '@cotato/lucky-potato-draw/manifest'
import { mergeRaceFeature } from '@cotato/merge-race/manifest'

export const imJunseoFeatures: FeatureDefinition[] = [
  hackathonTimerFeature,
  luckyPotatoDrawFeature,
  mergeRaceFeature,
]
