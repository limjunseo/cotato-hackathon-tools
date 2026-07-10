import type { FeatureDefinition } from '@cotato/contracts'

export const potatoNameDrawFeature: FeatureDefinition = {
  id: 'potato-name-draw',
  title: '행운의 감자 이름 추첨',
  owner: {
    id: 'im-junseo',
    name: '임준서',
  },
  description: '최대 12명의 이름 감자가 움직이는 동안 버튼을 눌러 오늘의 행운의 감자 2명을 추첨합니다.',
  path: '/features/potato-name-draw',
  status: 'ready',
  accent: '#f4b548',
  load: () => import('./App'),
}
