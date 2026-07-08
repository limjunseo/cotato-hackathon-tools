import type { FeatureDefinition } from '@cotato/contracts'

export const feature: FeatureDefinition = {
  id: 'FEATURE_ID',
  title: 'FEATURE_TITLE',
  owner: {
    id: 'OWNER_ID' as never,
    name: 'OWNER_NAME' as never,
  },
  description: '기능 설명을 작성하세요.',
  path: '/features/FEATURE_ID',
  status: 'beta',
  accent: '#ff6a00',
  load: () => import('./App'),
}
