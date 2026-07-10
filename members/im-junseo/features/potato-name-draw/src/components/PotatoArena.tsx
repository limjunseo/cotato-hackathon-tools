import { useEffect, useMemo, useRef } from 'react'
import type { DrawPhase, Participant } from '../types'
import { Potato } from './Potato'

type PotatoArenaProps = {
  participants: Participant[]
  phase: DrawPhase
  winnerIds: string[]
}

type Motion = {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
}

const DRAW_PHASES = new Set<DrawPhase>([
  'shuffling',
  'locking',
  'reveal-first',
  'reveal-second',
  'complete',
])

function createMotions(participants: Participant[]): Motion[] {
  const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(participants.length))))
  const rows = Math.ceil(participants.length / columns)

  return participants.map((participant, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = 9 + (columns === 1 ? 38 : column * (78 / (columns - 1)))
    const y = 10 + (rows === 1 ? 28 : row * (68 / Math.max(1, rows - 1)))
    const angle = (index * 2.399) + 0.7
    const speed = 8 + (index % 4) * 1.4

    return {
      id: participant.id,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: (index * 47) % 360,
      rotationSpeed: index % 2 === 0 ? 115 + index * 5 : -125 - index * 4,
    }
  })
}

export function PotatoArena({ participants, phase, winnerIds }: PotatoArenaProps) {
  const nodes = useRef(new Map<string, HTMLDivElement>())
  const motions = useMemo(() => createMotions(participants), [participants])

  useEffect(() => {
    for (const motion of motions) {
      const node = nodes.current.get(motion.id)
      if (!node) continue
      node.style.left = `${motion.x}%`
      node.style.top = `${motion.y}%`
      const piece = node.querySelector<HTMLElement>('.pnd-potato__body')
      if (piece) piece.style.transform = `rotate(${motion.rotation}deg)`
    }
  }, [motions])

  useEffect(() => {
    if (phase !== 'shuffling' && phase !== 'locking') return

    let frame = 0
    let lastTime = performance.now()
    const startedAt = lastTime

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.034)
      lastTime = time
      const elapsed = time - startedAt
      let speedScale = 1

      if (phase === 'locking') {
        if (elapsed < 550) speedScale = 1 + (elapsed / 550) * 3.6
        else if (elapsed < 1050) speedScale = 4.6
        else speedScale = Math.max(0, 4.6 * (1 - (elapsed - 1050) / 550))
      }

      for (let first = 0; first < motions.length; first += 1) {
        for (let second = first + 1; second < motions.length; second += 1) {
          const a = motions[first]
          const b = motions[second]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy)
          if (distance > 0 && distance < 14) {
            const force = (14 - distance) * 0.055
            const nx = dx / distance
            const ny = dy / distance
            a.vx -= nx * force
            a.vy -= ny * force
            b.vx += nx * force
            b.vy += ny * force
          }
        }
      }

      for (const motion of motions) {
        motion.x += motion.vx * delta * speedScale
        motion.y += motion.vy * delta * speedScale
        motion.rotation += motion.rotationSpeed * delta * speedScale

        if (motion.x <= 4 || motion.x >= 88) {
          motion.x = Math.min(88, Math.max(4, motion.x))
          motion.vx *= -1
        }
        if (motion.y <= 5 || motion.y >= 78) {
          motion.y = Math.min(78, Math.max(5, motion.y))
          motion.vy *= -1
        }

        const node = nodes.current.get(motion.id)
        if (!node) continue
        node.style.left = `${motion.x}%`
        node.style.top = `${motion.y}%`
        const piece = node.querySelector<HTMLElement>('.pnd-potato__body')
        if (piece) piece.style.transform = `rotate(${motion.rotation}deg)`
      }

      frame = window.requestAnimationFrame(animate)
    }

    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [motions, phase])

  if (!DRAW_PHASES.has(phase)) return null

  const isReveal = phase === 'reveal-first' || phase === 'reveal-second' || phase === 'complete'

  return (
    <div className={`pnd-arena pnd-arena--${phase}`} aria-hidden="true">
      <div className="pnd-arena__grid" />
      <div className="pnd-arena__glow" />
      {participants.map((participant) => {
        const winnerIndex = winnerIds.indexOf(participant.id)
        const isWinner = winnerIndex >= 0
        const isVisibleWinner = winnerIndex === 0
          || ((phase === 'reveal-second' || phase === 'complete') && winnerIndex === 1)

        return (
          <div
            key={participant.id}
            ref={(node) => {
              if (node) nodes.current.set(participant.id, node)
              else nodes.current.delete(participant.id)
            }}
            className={[
              'pnd-arena-potato',
              isReveal && !isWinner ? 'is-dimmed' : '',
              winnerIndex === 0 && isVisibleWinner ? 'is-winner is-winner--left' : '',
              winnerIndex === 1 && isVisibleWinner ? 'is-winner is-winner--right' : '',
              winnerIndex === 1 && phase === 'reveal-first' ? 'is-pending-winner' : '',
            ].filter(Boolean).join(' ')}
          >
            {isWinner && isVisibleWinner && <span className="pnd-winner-badge">LUCKY POTATO</span>}
            <Potato name={participant.name} />
          </div>
        )
      })}
    </div>
  )
}
