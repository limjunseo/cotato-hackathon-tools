import type { FeatureDefinition } from '@cotato/contracts'
import { hackathonAwardsFeature } from '@cotato/hackathon-awards/manifest'
import { hackathonTimerFeature } from '@cotato/hackathon-timer/manifest'
import { luckyPotatoDrawFeature } from '@cotato/lucky-potato-draw/manifest'
import { mergeRaceFeature } from '@cotato/merge-race/manifest'
import { potatoNameDrawFeature } from '@cotato/potato-name-draw/manifest'

export const imJunseoFeatures: FeatureDefinition[] = [
  hackathonAwardsFeature,
  hackathonTimerFeature,
  luckyPotatoDrawFeature,
  mergeRaceFeature,
  potatoNameDrawFeature,
]
