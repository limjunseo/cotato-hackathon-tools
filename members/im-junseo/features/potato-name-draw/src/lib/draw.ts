import type { Participant } from '../types'

export const MIN_PARTICIPANTS = 2
export const MAX_PARTICIPANTS = 12
const UINT32_RANGE = 0x1_0000_0000

export type RandomInt = (maxExclusive: number) => number

export function parseNames(value: string): string[] {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

export function validateNames(names: string[]): string | null {
  if (names.length === 0) {
    return '참가자 이름을 입력해주세요.'
  }

  if (names.length < MIN_PARTICIPANTS) {
    return '추첨을 위해 최소 2명이 필요합니다.'
  }

  if (names.length > MAX_PARTICIPANTS) {
    return '최대 12명까지 입력할 수 있습니다.'
  }

  return null
}

export function createParticipants(names: string[]): Participant[] {
  return names.map((name, index) => ({ id: `potato-${index}`, name }))
}

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new RangeError('maxExclusive must be a positive integer')
  }

  const acceptedRange = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive
  const randomValue = new Uint32Array(1)

  do {
    globalThis.crypto.getRandomValues(randomValue)
  } while (randomValue[0] >= acceptedRange)

  return randomValue[0] % maxExclusive
}

export function drawTwoParticipants(
  participants: Participant[],
  randomInt: RandomInt = secureRandomInt,
): [Participant, Participant] {
  if (participants.length < MIN_PARTICIPANTS) {
    throw new RangeError('at least two participants are required')
  }

  const pool = [...participants]
  const firstIndex = randomInt(pool.length)
  if (!Number.isInteger(firstIndex) || firstIndex < 0 || firstIndex >= pool.length) {
    throw new RangeError('randomInt returned a value outside the requested range')
  }

  const [first] = pool.splice(firstIndex, 1)
  const secondIndex = randomInt(pool.length)
  if (!Number.isInteger(secondIndex) || secondIndex < 0 || secondIndex >= pool.length) {
    throw new RangeError('randomInt returned a value outside the requested range')
  }

  return [first, pool[secondIndex]]
}
