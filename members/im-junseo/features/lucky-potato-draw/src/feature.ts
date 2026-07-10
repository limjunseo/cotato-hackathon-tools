import type { FeatureDefinition } from '@cotato/contracts'

export const luckyPotatoDrawFeature: FeatureDefinition = {
  id: 'lucky-potato-draw',
  title: '행운의 감자 추첨',
  owner: {
    id: 'im-junseo',
    name: '임준서',
  },
  description: '감자 핀볼이 1부터 41까지의 번호 중 원하는 개수만큼 중복 없이 추첨합니다.',
  path: '/features/lucky-potato-draw',
  status: 'ready',
  accent: '#f5b642',
  load: () => import('./App'),
}
