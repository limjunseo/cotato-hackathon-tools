import type { FeatureDefinition } from '@cotato/contracts'

export const hackathonAwardsFeature: FeatureDefinition = {
  id: 'hackathon-awards',
  title: '코커톤 파이널 어워즈',
  owner: {
    id: 'im-junseo',
    name: '임준서',
  },
  description: '3등부터 1등까지 팀명과 상금을 한 단계씩 공개하는 행사용 시상 화면입니다.',
  path: '/features/hackathon-awards',
  status: 'ready',
  accent: '#f2b84b',
  load: () => import('./App'),
}
