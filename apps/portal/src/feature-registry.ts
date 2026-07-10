import type { FeatureDefinition, FeatureOwner } from '@cotato/contracts'
import { imJunseoFeatures } from '@cotato/member-im-junseo/feature-manifest'
import { kimGiminFeatures } from '@cotato/member-kim-gimin/feature-manifest'
import { parkHyeonjeongFeatures } from '@cotato/member-park-hyeonjeong/feature-manifest'

export type MemberProfile = FeatureOwner & {
  role: string
  accent: string
}

export const members: MemberProfile[] = [
  { id: 'im-junseo', name: '임준서', role: 'Feature Owner', accent: '#ff6a00' },
  { id: 'park-hyeonjeong', name: '박현정', role: 'Feature Owner', accent: '#4e8cff' },
  { id: 'kim-gimin', name: '김기민', role: 'Feature Owner', accent: '#c955b8' },
]

export const features: FeatureDefinition[] = [
  ...imJunseoFeatures,
  ...parkHyeonjeongFeatures,
  ...kimGiminFeatures,
]

const ids = new Set<string>()
const paths = new Set<string>()

for (const feature of features) {
  if (ids.has(feature.id)) throw new Error(`중복 기능 ID: ${feature.id}`)
  if (paths.has(feature.path)) throw new Error(`중복 기능 경로: ${feature.path}`)
  ids.add(feature.id)
  paths.add(feature.path)
}

export function findFeatureByPath(path: string) {
  return features.find((feature) => feature.path === path) ?? null
}

export function findFeatureById(id: string) {
  return features.find((feature) => feature.id === id) ?? null
}
