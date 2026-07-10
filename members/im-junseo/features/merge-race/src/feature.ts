import type { FeatureDefinition } from '@cotato/contracts'

export const mergeRaceFeature: FeatureDefinition = {
  id: 'merge-race',
  title: '실시간 COMMIT RACE',
  owner: {
    id: 'im-junseo',
    name: '임준서',
  },
  description: 'GitHub merge를 감지해 6개 팀의 커밋 점수와 감자 레이스를 실시간으로 보여줍니다.',
  path: '/features/merge-race',
  status: 'ready',
  accent: '#ff7a2f',
  devPort: 4176,
  load: () => import('./App'),
}
