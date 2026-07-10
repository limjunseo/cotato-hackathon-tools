import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_DRAW_COUNT,
  MAX_DRAW_NUMBER,
  drawUniqueNumbers,
  normalizeDrawCount,
  secureRandomInt,
} from './draw'

describe('drawUniqueNumbers', () => {
  it('draws the requested amount without duplicates', () => {
    const values = [4, 11, 2, 8, 0]
    const randomInt = vi.fn((maxExclusive: number) => values.shift()! % maxExclusive)

    const result = drawUniqueNumbers(5, randomInt)

    expect(result).toHaveLength(5)
    expect(new Set(result).size).toBe(5)
    expect(result.every((number) => number >= 1 && number <= 41)).toBe(true)
  })

  it('can draw all 41 numbers exactly once', () => {
    const result = drawUniqueNumbers(MAX_DRAW_NUMBER, () => 0)

    expect(result).toEqual(Array.from({ length: 41 }, (_, index) => index + 1))
  })

  it.each([0, 42, 1.5])('rejects an invalid draw count: %s', (count) => {
    expect(() => drawUniqueNumbers(count)).toThrow(RangeError)
  })

  it('rejects an invalid random index provider', () => {
    expect(() => drawUniqueNumbers(1, (maxExclusive) => maxExclusive)).toThrow(RangeError)
  })
})

describe('normalizeDrawCount', () => {
  it('clamps and rounds count input into the supported range', () => {
    expect(normalizeDrawCount(-3)).toBe(1)
    expect(normalizeDrawCount(6.6)).toBe(7)
    expect(normalizeDrawCount(99)).toBe(41)
    expect(normalizeDrawCount(Number.NaN)).toBe(DEFAULT_DRAW_COUNT)
  })
})

describe('secureRandomInt', () => {
  it('returns a value inside the requested range', () => {
    expect(secureRandomInt(7)).toBeGreaterThanOrEqual(0)
    expect(secureRandomInt(7)).toBeLessThan(7)
  })
})
