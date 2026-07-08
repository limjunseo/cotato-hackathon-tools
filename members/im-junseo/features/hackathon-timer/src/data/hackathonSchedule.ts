import type { ScheduleItem } from '../types'

const at = (value: string) => new Date(`${value}:00+09:00`).getTime()

export const EVENT_NAME = 'COTATO 2026 코커톤'
export const EVENT_DATE_LABEL = '2026.07.10 FRI — 07.11 SAT'

export const HACKATHON_SCHEDULE: ScheduleItem[] = [
  {
    id: 'opening',
    title: '개회식',
    details: '팀·진행 방식·평가 기준·전체 타임테이블을 안내합니다.',
    timeLabel: '19:00',
    startAt: at('2026-07-10T19:00'),
    endAt: at('2026-07-10T19:30'),
  },
  {
    id: 'planning',
    title: '팀별 기획',
    details: '팀별로 문제를 정의하고 MVP와 구현 범위를 구체화합니다.',
    timeLabel: '19:30–23:00',
    startAt: at('2026-07-10T19:30'),
    endAt: at('2026-07-10T23:00'),
  },
  {
    id: 'night-snack',
    title: '야식 타임',
    details: '잠시 손을 놓고 함께 야식을 즐기는 시간입니다.',
    timeLabel: '23:00–00:00',
    startAt: at('2026-07-10T23:00'),
    endAt: at('2026-07-11T00:00'),
  },
  {
    id: 'proposal',
    title: '기획안 제출',
    details: '서비스 개요·배경·페인포인트·MVP를 포함한 기획안을 제출합니다.',
    timeLabel: '~01:00',
    startAt: at('2026-07-11T00:00'),
    endAt: at('2026-07-11T01:00'),
    isDeadline: true,
  },
  {
    id: 'deep-work',
    title: '집중 개발 시간',
    details: '핵심 기능 구현과 서비스 완성에 집중합니다.',
    timeLabel: '01:00–08:00',
    startAt: at('2026-07-11T01:00'),
    endAt: at('2026-07-11T08:00'),
  },
  {
    id: 'breakfast',
    title: '아침 식사',
    details: '아침 식사와 함께 잠시 재정비합니다.',
    timeLabel: '08:00–08:50',
    startAt: at('2026-07-11T08:00'),
    endAt: at('2026-07-11T08:50'),
  },
  {
    id: 'development-deadline',
    title: '개발 마감 및 발표 자료 제출',
    details: '개발을 마무리하고 발표 자료와 결과물을 최종 제출합니다.',
    timeLabel: '~10:30',
    startAt: at('2026-07-11T08:50'),
    endAt: at('2026-07-11T10:30'),
    isDeadline: true,
  },
  {
    id: 'pre-evaluation',
    title: '심사위원 프로젝트 사전 평가',
    details: '배포 서버 접속과 GitHub·Figma 자료를 중심으로 사전 평가합니다.',
    timeLabel: '10:30–11:00',
    startAt: at('2026-07-11T10:30'),
    endAt: at('2026-07-11T11:00'),
  },
  {
    id: 'presentation',
    title: '발표 및 심사',
    details: '팀별 결과물을 발표하고 심사위원 피드백을 진행합니다.',
    timeLabel: '11:00–13:30',
    startAt: at('2026-07-11T11:00'),
    endAt: at('2026-07-11T13:30'),
  },
  {
    id: 'awards',
    title: '시상 및 폐회',
    details: '수상 팀을 발표하고 코커톤을 공식적으로 마무리합니다.',
    timeLabel: '13:30–14:00',
    startAt: at('2026-07-11T13:30'),
    endAt: at('2026-07-11T14:00'),
  },
  {
    id: 'cleanup',
    title: '정리 및 해산',
    details: '사용한 공간과 장비를 정리한 뒤 안전하게 귀가합니다.',
    timeLabel: '~14:30',
    startAt: at('2026-07-11T14:00'),
    endAt: at('2026-07-11T14:30'),
  },
]
