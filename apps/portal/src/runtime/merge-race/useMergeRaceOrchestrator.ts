import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { findFeatureById } from '../../feature-registry'
import { decideMergeRaceAction, getMergeRaceScreen } from './mergeRacePolicy'
import {
  ACTIVE_PRESENTATION_KEY,
  LAST_SEQUENCE_KEY,
  appendPendingEvents,
  clearActivePresentation,
  createPresentation,
  drainPendingEvents,
  readActivePresentation,
  readLastSequence,
  readPendingEvents,
  writeActivePresentation,
  writeLastSequence,
  writeLatestState,
} from './presentationStorage'
import type { MergeRaceState } from './types'

function requireFeaturePath(id: string) {
  const path = findFeatureById(id)?.path
  if (!path) throw new Error(`Merge Race orchestration requires the ${id} feature.`)
  return path
}

const timerPath = requireFeaturePath('hackathon-timer')
const roulettePath = requireFeaturePath('lucky-potato-draw')
const mergeRacePath = requireFeaturePath('merge-race')

const featurePaths = {
  mergeRace: mergeRacePath,
  roulette: roulettePath,
  timer: timerPath,
}

export function useMergeRaceOrchestrator({
  navigate,
  path,
}: {
  navigate: (path: string) => void
  path: string
}) {
  const latestState = useRef<MergeRaceState | null>(null)
  const navigateRef = useRef(navigate)
  const pathRef = useRef(path)
  const [pendingCount, setPendingCount] = useState(() => readPendingEvents().length)
  const [presentationRevision, setPresentationRevision] = useState(0)
  navigateRef.current = navigate
  pathRef.current = path

  const presentPending = useEffectEvent((state: MergeRaceState | null = latestState.current) => {
    if (!state) return
    const events = drainPendingEvents()
    if (events.length === 0) return

    const presentation = createPresentation(events, state, timerPath)
    writeActivePresentation(presentation)
    setPendingCount(0)
    setPresentationRevision((current) => current + 1)
    if (pathRef.current !== mergeRacePath) {
      navigateRef.current(mergeRacePath)
    }
  })

  useEffect(() => {
    let stopped = false

    const syncState = async () => {
      try {
        const response = await fetch('/__merge-race/state', { cache: 'no-store' })
        const state = await response.json() as MergeRaceState
        if (!response.ok || !state.ok || stopped) return

        latestState.current = state
        writeLatestState(state)

        if (
          pathRef.current === timerPath
          && readPendingEvents().length > 0
          && readActivePresentation() === null
        ) {
          presentPending(state)
        }

        const hasSequenceCheckpoint = window.sessionStorage.getItem(LAST_SEQUENCE_KEY) !== null
        if (!hasSequenceCheckpoint) {
          writeLastSequence(state.latestSequence)
          return
        }

        const lastSequence = readLastSequence()
        const newEvents = state.events.filter((event) => event.sequence > lastSequence)
        writeLastSequence(state.latestSequence)
        if (newEvents.length === 0) return

        const activePresentation = readActivePresentation()
        const screen = getMergeRaceScreen(pathRef.current, featurePaths)
        const decision = decideMergeRaceAction(screen, activePresentation !== null)

        if (decision === 'show-in-place') return

        const pending = appendPendingEvents(newEvents)
        setPendingCount(pending.length)
        if (decision === 'present-now') {
          presentPending(state)
        }
      } catch {
        // Existing screens keep running while the local server retries.
      }
    }

    void syncState()
    const timer = window.setInterval(() => void syncState(), 1_000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (path !== timerPath || pendingCount === 0) return

    const active = readActivePresentation()
    if (active && active.startedAt + active.durationMs > Date.now()) return
    if (active) clearActivePresentation()
    presentPending()
  }, [path, pendingCount])

  useEffect(() => {
    if (path !== mergeRacePath) return
    const active = readActivePresentation()
    if (!active) return

    const remaining = Math.max(0, active.startedAt + active.durationMs - Date.now())
    const timer = window.setTimeout(() => {
      const pending = readPendingEvents()
      if (pending.length > 0 && latestState.current) {
        presentPending(latestState.current)
        return
      }

      clearActivePresentation()
      setPresentationRevision((current) => current + 1)
      navigateRef.current(timerPath)
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [path, presentationRevision])

  useEffect(() => {
    if (path !== timerPath) return
    const active = readActivePresentation()
    if (active && active.startedAt + active.durationMs <= Date.now()) {
      window.sessionStorage.removeItem(ACTIVE_PRESENTATION_KEY)
    }
  }, [path])
}
