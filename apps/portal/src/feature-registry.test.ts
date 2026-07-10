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

  it('exposes Im Junseo features under the expected ownership', () => {
    const timer = findFeatureByPath('/features/hackathon-timer')
    const luckyPotato = findFeatureByPath('/features/lucky-potato-draw')

    expect(timer?.id).toBe('hackathon-timer')
    expect(timer?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(luckyPotato?.id).toBe('lucky-potato-draw')
    expect(luckyPotato?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(features).toHaveLength(2)
  })
})
