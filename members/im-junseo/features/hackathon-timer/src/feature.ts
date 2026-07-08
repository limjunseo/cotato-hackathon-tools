import type { FeatureDefinition } from '@cotato/contracts'

export const hackathonTimerFeature: FeatureDefinition = {
  id: 'hackathon-timer',
  title: '해커톤 타이머',
  owner: {
    id: 'im-junseo',
    name: '임준서',
  },
  description:
    '코커톤의 고정 타임테이블과 현재 세션 종료까지 남은 시간을 16:9 화면으로 안내합니다.',
  path: '/features/hackathon-timer',
  status: 'ready',
  accent: '#ff6a00',
  load: () => import('./App'),
}
