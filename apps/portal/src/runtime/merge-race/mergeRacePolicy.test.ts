import { describe, expect, it } from 'vitest'
import { decideMergeRaceAction, getMergeRaceScreen, getPresentationEndAction } from './mergeRacePolicy'

const paths = {
  mergeRace: '/features/merge-race',
  roulette: '/features/lucky-potato-draw',
  timer: '/features/hackathon-timer',
}

describe('merge race portal policy', () => {
  it('interrupts only the timer', () => {
    expect(decideMergeRaceAction(getMergeRaceScreen(paths.timer, paths), false)).toBe('present-now')
    expect(decideMergeRaceAction(getMergeRaceScreen(paths.roulette, paths), false)).toBe('queue')
    expect(decideMergeRaceAction(getMergeRaceScreen('/', paths), false)).toBe('queue')
  })

  it('queues during an automatic merge presentation but animates in manual live mode', () => {
    expect(decideMergeRaceAction('merge-race', true)).toBe('queue')
    expect(decideMergeRaceAction('merge-race', false)).toBe('show-in-place')
  })

  it('chains pending events before returning to the timer', () => {
    expect(getPresentationEndAction(2)).toBe('next-presentation')
    expect(getPresentationEndAction(0)).toBe('return-timer')
  })
})
