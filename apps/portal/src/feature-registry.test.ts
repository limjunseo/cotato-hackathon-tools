import { describe, expect, it } from 'vitest'
import { features, findFeatureById, findFeatureByPath, members } from './feature-registry'

describe('feature registry', () => {
  it('registers every member once', () => {
    expect(members.map((member) => member.id)).toEqual([
      'im-junseo',
      'park-hyeonjeong',
      'kim-gimin',
    ])
  })

  it('exposes Im Junseo features under the expected ownership', () => {
    const hackathonAwards = findFeatureByPath('/features/hackathon-awards')
    const timer = findFeatureByPath('/features/hackathon-timer')
    const luckyPotato = findFeatureByPath('/features/lucky-potato-draw')
    const mergeRace = findFeatureByPath('/features/merge-race')
    const potatoNameDraw = findFeatureByPath('/features/potato-name-draw')

    expect(hackathonAwards?.id).toBe('hackathon-awards')
    expect(hackathonAwards?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(timer?.id).toBe('hackathon-timer')
    expect(timer?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(luckyPotato?.id).toBe('lucky-potato-draw')
    expect(luckyPotato?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(mergeRace?.id).toBe('merge-race')
    expect(mergeRace?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(potatoNameDraw?.id).toBe('potato-name-draw')
    expect(potatoNameDraw?.owner).toEqual({ id: 'im-junseo', name: '임준서' })
    expect(features).toHaveLength(5)
  })

  it('finds orchestration targets by stable feature id', () => {
    expect(findFeatureById('hackathon-awards')?.path).toBe('/features/hackathon-awards')
    expect(findFeatureById('hackathon-timer')?.path).toBe('/features/hackathon-timer')
    expect(findFeatureById('lucky-potato-draw')?.path).toBe('/features/lucky-potato-draw')
    expect(findFeatureById('merge-race')?.path).toBe('/features/merge-race')
    expect(findFeatureById('potato-name-draw')?.path).toBe('/features/potato-name-draw')
  })
})
