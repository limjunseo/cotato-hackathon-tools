import { describe, expect, it } from 'vitest'
import { createParticipants, drawTwoParticipants, parseNames, validateNames } from './draw'

describe('name parsing and validation', () => {
  it('trims comma-separated names and removes empty entries', () => {
    expect(parseNames(' 김철수, , 이영희, 박감자, ')).toEqual(['김철수', '이영희', '박감자'])
  })

  it('enforces the two-to-twelve participant range', () => {
    expect(validateNames([])).toBe('참가자 이름을 입력해주세요.')
    expect(validateNames(['한명'])).toBe('추첨을 위해 최소 2명이 필요합니다.')
    expect(validateNames(Array.from({ length: 13 }, (_, index) => `${index}`)))
      .toBe('최대 12명까지 입력할 수 있습니다.')
    expect(validateNames(['한명', '두명'])).toBeNull()
  })
})

describe('drawTwoParticipants', () => {
  it('draws two different participants at click time', () => {
    const participants = createParticipants(['감자A', '감자B', '감자C'])
    const requestedSizes: number[] = []
    const winners = drawTwoParticipants(participants, (maxExclusive) => {
      requestedSizes.push(maxExclusive)
      return maxExclusive - 1
    })

    expect(requestedSizes).toEqual([3, 2])
    expect(winners.map(({ name }) => name)).toEqual(['감자C', '감자B'])
    expect(new Set(winners.map(({ id }) => id)).size).toBe(2)
  })
})
