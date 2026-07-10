import { describe, expect, it } from 'vitest'
import { getStageNumber, moveStage } from './stages'

describe('award stages', () => {
  it('moves through the reveal sequence', () => {
    expect(moveStage('intro', 1)).toBe('third')
    expect(moveStage('third', 1)).toBe('second')
    expect(moveStage('second', 1)).toBe('first')
    expect(moveStage('first', 1)).toBe('complete')
  })

  it('does not move beyond the first or last stage', () => {
    expect(moveStage('intro', -1)).toBe('intro')
    expect(moveStage('complete', 1)).toBe('complete')
    expect(getStageNumber('first')).toBe(3)
  })
})
