import type React from 'react'

export type FeatureStatus = 'ready' | 'beta' | 'planned'

export type FeatureOwner = {
  id: 'im-junseo' | 'park-hyeonjeong' | 'kim-gimin'
  name: '임준서' | '박현정' | '김기민'
}

export type FeatureModule = {
  default: React.ComponentType
}

export type FeatureDefinition = {
  id: string
  title: string
  owner: FeatureOwner
  description: string
  path: `/features/${string}`
  status: FeatureStatus
  accent: string
  devPort?: number
  load: () => Promise<FeatureModule>
}
