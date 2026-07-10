export const MIN_DRAW_NUMBER = 1
export const MAX_DRAW_NUMBER = 41
export const DEFAULT_DRAW_COUNT = 5

const UINT32_RANGE = 0x1_0000_0000

export type RandomInt = (maxExclusive: number) => number

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

export function normalizeDrawCount(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_DRAW_COUNT
  }

  return Math.min(MAX_DRAW_NUMBER, Math.max(MIN_DRAW_NUMBER, Math.round(value)))
}

export function drawUniqueNumbers(
  count: number,
  randomInt: RandomInt = secureRandomInt,
): number[] {
  if (!Number.isInteger(count) || count < MIN_DRAW_NUMBER || count > MAX_DRAW_NUMBER) {
    throw new RangeError(`count must be between ${MIN_DRAW_NUMBER} and ${MAX_DRAW_NUMBER}`)
  }

  const pool = Array.from(
    { length: MAX_DRAW_NUMBER },
    (_, index) => index + MIN_DRAW_NUMBER,
  )

  for (let index = 0; index < count; index += 1) {
    const remaining = pool.length - index
    const offset = randomInt(remaining)

    if (!Number.isInteger(offset) || offset < 0 || offset >= remaining) {
      throw new RangeError('randomInt returned a value outside the requested range')
    }

    const swapIndex = index + offset
    const current = pool[index]
    pool[index] = pool[swapIndex]
    pool[swapIndex] = current
  }

  return pool.slice(0, count)
}
