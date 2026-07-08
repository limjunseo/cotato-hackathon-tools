import { describe, expect, it } from 'vitest'
import { features, findFeatureByPath, members } from './feature-registry'

describe('feature registry', () => {
  it('registers every member once', () => {
    expect(members.map((member) => member.id)).toEqual([
      'im-junseo',
      'park-hyeonjeong',
      'kim-gimin',
    ])
  })

  it('exposes the hackathon timer under Im Junseo ownership', () => {
    const timer = findFeatureByPath('/features/hackathon-timer')

    expect(timer?.id).toBe('hackathon-timer')
    expect(timer?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(features).toHaveLength(1)
  })
})
