import { useEffect, useEffectEvent, useRef } from 'react'
import potatoWorld from '../assets/potato-world.png'
import { PINBALL_DRAW_DURATION_MS, RACE_DURATION_MS, getRaceTiming } from '../lib/pinball'
import type { DrawPhase } from '../types'

const BOARD_WIDTH = 760
const VIEW_HEIGHT = 820
const WORLD_HEIGHT = 4_310
const MAX_CAMERA_Y = WORLD_HEIGHT - VIEW_HEIGHT
const BALL_SCALE = 0.56
const BALL_RADIUS = 19
const FLOOR_Y = 3_900
const WINNER_HOLD_Y = 3_750
const PARTICIPANTS = Array.from({ length: 41 }, (_, index) => index + 1)

type Peg = {
  x: number
  y: number
  radius: number
  kind?: 'bumper'
}

type BallState = {
  number: number
  rank: number
  finishAt: number
  gravity: number
  startY: number
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  finished: boolean
}

const COURSE_PEGS: Peg[] = Array.from({ length: 23 }, (_, row) => {
  const y = 285 + row * 145
  const xPositions = row % 2 === 0
    ? [105, 240, 380, 520, 655]
    : [170, 310, 450, 590]
  return xPositions.map((x) => ({ x, y, radius: row % 3 === 0 ? 11 : 10 }))
}).flat()

const BUMPERS: Peg[] = [
  { x: 260, y: 710, radius: 25, kind: 'bumper' },
  { x: 510, y: 1_280, radius: 25, kind: 'bumper' },
  { x: 230, y: 1_850, radius: 25, kind: 'bumper' },
  { x: 520, y: 2_420, radius: 25, kind: 'bumper' },
  { x: 250, y: 2_990, radius: 25, kind: 'bumper' },
  { x: 500, y: 3_450, radius: 25, kind: 'bumper' },
]

const PEGS = [...COURSE_PEGS, ...BUMPERS]
const COURSE_MARKERS = [880, 1_580, 2_280, 2_980, 3_620]

const POTATO_CHARACTERS = [
  { x: 110, y: 55, width: 138, height: 150 },
  { x: 345, y: 70, width: 150, height: 155 },
  { x: 552, y: 45, width: 165, height: 175 },
  { x: 95, y: 242, width: 145, height: 160 },
  { x: 292, y: 246, width: 182, height: 150 },
  { x: 465, y: 200, width: 142, height: 170 },
  { x: 114, y: 397, width: 188, height: 165 },
  { x: 334, y: 405, width: 178, height: 160 },
  { x: 522, y: 365, width: 150, height: 165 },
  { x: 98, y: 565, width: 142, height: 155 },
  { x: 354, y: 580, width: 160, height: 170 },
  { x: 198, y: 735, width: 165, height: 175 },
  { x: 526, y: 735, width: 150, height: 170 },
] as const

type PinballBoardProps = {
  finishOrder: number[]
  phase: DrawPhase
  runId: number
  winnerCount: number
  onNumberLanded: (number: number) => void
  onComplete: () => void
}

function getWaitingPosition(index: number) {
  const row = Math.floor(index / 14)
  const column = index % 14
  const columnsInRow = row === 2 ? 13 : 14
  const rowWidth = 650
  const startX = (BOARD_WIDTH - rowWidth) / 2

  return {
    x: startX + column * (rowWidth / Math.max(1, columnsInRow - 1)),
    y: 78 + row * 58,
  }
}

function getGravity(startY: number, destinationY: number, durationMs: number) {
  const seconds = Math.max(2.5, durationMs / 1000)
  return Math.min(760, Math.max(24, (2 * (destinationY - startY) / (seconds * seconds)) * 0.94))
}

function collideWithPeg(ball: BallState, peg: Peg) {
  const dx = ball.x - peg.x
  const dy = ball.y - peg.y
  const minimumDistance = BALL_RADIUS + peg.radius
  const distanceSquared = dx * dx + dy * dy

  if (distanceSquared >= minimumDistance * minimumDistance) {
    return
  }

  const distance = Math.sqrt(distanceSquared) || 0.001
  const normalX = distanceSquared === 0 ? (ball.number % 2 === 0 ? 1 : -1) : dx / distance
  const normalY = distanceSquared === 0 ? -1 : dy / distance
  const overlap = minimumDistance - distance

  ball.x += normalX * overlap
  ball.y += normalY * overlap

  const velocityAlongNormal = ball.vx * normalX + ball.vy * normalY
  if (velocityAlongNormal < 0) {
    const restitution = peg.kind === 'bumper' ? 1.04 : 0.74
    ball.vx -= (1 + restitution) * velocityAlongNormal * normalX
    ball.vy -= (1 + restitution) * velocityAlongNormal * normalY
  }

  if (peg.kind === 'bumper') {
    ball.vx += normalX * 56
    ball.vy += normalY * 56
  }
}

function collideBalls(balls: BallState[]) {
  for (let firstIndex = 0; firstIndex < balls.length; firstIndex += 1) {
    const first = balls[firstIndex]
    if (first.finished) {
      continue
    }

    for (let secondIndex = firstIndex + 1; secondIndex < balls.length; secondIndex += 1) {
      const second = balls[secondIndex]
      if (second.finished) {
        continue
      }

      const dx = second.x - first.x
      const dy = second.y - first.y
      const minimumDistance = BALL_RADIUS * 2
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared === 0 || distanceSquared >= minimumDistance * minimumDistance) {
        continue
      }

      const distance = Math.sqrt(distanceSquared)
      const normalX = dx / distance
      const normalY = dy / distance
      const overlap = (minimumDistance - distance) / 2
      first.x -= normalX * overlap
      first.y -= normalY * overlap
      second.x += normalX * overlap
      second.y += normalY * overlap

      const relativeVelocity = (second.vx - first.vx) * normalX
        + (second.vy - first.vy) * normalY
      if (relativeVelocity < 0) {
        const impulse = -(1 + 0.68) * relativeVelocity / 2
        first.vx -= impulse * normalX
        first.vy -= impulse * normalY
        second.vx += impulse * normalX
        second.vy += impulse * normalY
      }
    }
  }
}

export function PinballBoard({
  finishOrder,
  phase,
  runId,
  winnerCount,
  onNumberLanded,
  onComplete,
}: PinballBoardProps) {
  const svgElement = useRef<SVGSVGElement>(null)
  const leaderMarker = useRef<SVGGElement>(null)
  const ballElements = useRef(new Map<number, SVGGElement>())
  const timerElement = useRef<HTMLSpanElement>(null)
  const cameraLabel = useRef<HTMLElement>(null)
  const cameraProgress = useRef<HTMLElement>(null)
  const reportLanded = useEffectEvent(onNumberLanded)
  const reportComplete = useEffectEvent(onComplete)

  useEffect(() => {
    if (phase !== 'running') {
      const cameraY = phase === 'complete' ? MAX_CAMERA_Y : 0
      svgElement.current?.setAttribute('viewBox', `0 ${cameraY} ${BOARD_WIDTH} ${VIEW_HEIGHT}`)
      leaderMarker.current?.setAttribute('opacity', '0')

      PARTICIPANTS.forEach((number, index) => {
        const element = ballElements.current.get(number)
        const waiting = getWaitingPosition(index)
        if (element) {
          element.style.opacity = phase === 'complete' ? '0' : '1'
          element.setAttribute(
            'transform',
            `translate(${waiting.x} ${waiting.y}) scale(${BALL_SCALE})`,
          )
        }
      })
      return
    }

    if (finishOrder.length !== PARTICIPANTS.length) {
      return
    }

    const timing = getRaceTiming(winnerCount)
    const rankByNumber = new Map(finishOrder.map((number, rank) => [number, rank]))
    const firstWinnerAt = timing.winnerFinishTimes[0]
    const balls: BallState[] = PARTICIPANTS.map((number, index) => {
      const waiting = getWaitingPosition(index)
      const rank = rankByNumber.get(number) ?? PARTICIPANTS.length
      const isWinner = rank < winnerCount
      const finishAt = isWinner
        ? timing.winnerFinishTimes[rank]
        : timing.raceDuration + 8_000 + (rank - winnerCount) * 220
      const gravityTarget = isWinner ? WINNER_HOLD_Y - rank * 30 : FLOOR_Y
      const gravityDuration = isWinner ? firstWinnerAt : finishAt

      return {
        number,
        rank,
        finishAt,
        gravity: getGravity(waiting.y, gravityTarget, gravityDuration),
        startY: waiting.y,
        x: waiting.x,
        y: waiting.y,
        vx: ((number * 29 + index * 47 + runId * 31) % 150) - 75,
        vy: 18 + ((number * 13) % 36),
        angle: 0,
        finished: false,
      }
    })

    ballElements.current.forEach((element) => {
      element.style.opacity = '1'
    })
    leaderMarker.current?.setAttribute('opacity', '1')

    const requestFrame = window.requestAnimationFrame?.bind(window)
      ?? ((callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16))
    const cancelFrame = window.cancelAnimationFrame?.bind(window) ?? window.clearTimeout
    let animationFrame = 0
    let startTime = 0
    let previousTime = 0
    let finishedWinnerCount = 0
    let currentCameraY = 0

    const finishWinner = (ball: BallState) => {
      ball.finished = true
      ball.y = FLOOR_Y
      const element = ballElements.current.get(ball.number)
      if (element) {
        element.setAttribute(
          'transform',
          `translate(${ball.x.toFixed(2)} ${FLOOR_Y}) rotate(${ball.angle.toFixed(2)}) scale(${BALL_SCALE})`,
        )
        element.style.opacity = '0'
      }
      finishedWinnerCount += 1
      reportLanded(ball.number)
    }

    const animate = (time: number) => {
      if (startTime === 0) {
        startTime = time
        previousTime = time
      }

      const elapsed = time - startTime
      const deltaTime = Math.min((time - previousTime) / 1000, 0.032)
      previousTime = time

      if (timerElement.current) {
        timerElement.current.textContent = `${(
          Math.max(0, timing.raceDuration - elapsed) / 1000
        ).toFixed(1)} SEC`
      }

      const step = deltaTime / 2
      for (let substep = 0; substep < 2; substep += 1) {
        balls.forEach((ball) => {
          if (ball.finished) {
            return
          }

          const isWinner = ball.rank < winnerCount
          const holdY = WINNER_HOLD_Y - ball.rank * 30
          const releaseAt = ball.finishAt - 850
          const finishPull = isWinner && elapsed >= releaseAt ? 720 : 0

          if (isWinner && elapsed < releaseAt) {
            const guideProgress = Math.min(1, elapsed / Math.max(1, releaseAt))
            const easedProgress = 1 - (1 - guideProgress) ** 2
            const guidedY = ball.startY + (holdY - ball.startY) * easedProgress
            ball.y = Math.max(ball.y, guidedY)
          }

          ball.vy += (ball.gravity + finishPull) * step
          ball.vx *= 0.999
          ball.vx = Math.max(-235, Math.min(235, ball.vx))
          ball.vy = Math.min(520, ball.vy)
          ball.x += ball.vx * step
          ball.y += ball.vy * step

          if (ball.x < BALL_RADIUS + 25) {
            ball.x = BALL_RADIUS + 25
            ball.vx = Math.abs(ball.vx) * 0.8
          }
          if (ball.x > BOARD_WIDTH - BALL_RADIUS - 25) {
            ball.x = BOARD_WIDTH - BALL_RADIUS - 25
            ball.vx = -Math.abs(ball.vx) * 0.8
          }
          if (ball.y < BALL_RADIUS + 20) {
            ball.y = BALL_RADIUS + 20
            ball.vy = Math.abs(ball.vy)
          }

          PEGS.forEach((peg) => collideWithPeg(ball, peg))

          if (isWinner && ball.y >= holdY && elapsed < releaseAt) {
            ball.y = holdY
            ball.vy = -Math.max(30, Math.min(72, Math.abs(ball.vy) * 0.2))
          } else if (ball.y >= FLOOR_Y) {
            ball.y = FLOOR_Y
            ball.vy = -Math.max(85, Math.min(185, Math.abs(ball.vy) * 0.42))
            ball.vx += (ball.number % 2 === 0 ? 1 : -1) * 16
          }
        })

        collideBalls(balls)
      }

      balls.forEach((ball) => {
        if (ball.finished) {
          return
        }

        ball.angle += ball.vx * deltaTime * 0.22
        const element = ballElements.current.get(ball.number)
        if (element) {
          element.setAttribute(
            'transform',
            `translate(${ball.x.toFixed(2)} ${ball.y.toFixed(2)}) rotate(${ball.angle.toFixed(2)}) scale(${BALL_SCALE})`,
          )
        }
      })

      const dueWinners = balls
        .filter((ball) => (
          !ball.finished
          && ball.rank < winnerCount
          && elapsed >= ball.finishAt
        ))
        .sort((first, second) => first.rank - second.rank)
      dueWinners.forEach(finishWinner)

      const focusRank = Math.min(finishedWinnerCount, winnerCount - 1)
      const focusNumber = finishOrder[focusRank]
      const focusBall = balls.find((ball) => ball.number === focusNumber)
      if (focusBall) {
        const desiredCameraY = Math.min(
          MAX_CAMERA_Y,
          Math.max(0, focusBall.y - VIEW_HEIGHT * 0.48),
        )
        const smoothedCameraY = currentCameraY
          + (desiredCameraY - currentCameraY) * Math.min(1, deltaTime * 3.4)
        currentCameraY = Math.max(currentCameraY, smoothedCameraY)
        svgElement.current?.setAttribute(
          'viewBox',
          `0 ${currentCameraY.toFixed(2)} ${BOARD_WIDTH} ${VIEW_HEIGHT}`,
        )
        leaderMarker.current?.setAttribute(
          'transform',
          `translate(${focusBall.x.toFixed(2)} ${focusBall.y.toFixed(2)})`,
        )
        if (cameraLabel.current) {
          cameraLabel.current.textContent = `${focusRank + 1}위 추적 · #${focusNumber}`
        }
        if (cameraProgress.current) {
          cameraProgress.current.style.width = `${Math.min(100, currentCameraY / MAX_CAMERA_Y * 100)}%`
        }
      }

      if (finishedWinnerCount >= winnerCount) {
        reportComplete()
        return
      }

      animationFrame = requestFrame(animate)
    }

    animationFrame = requestFrame(animate)
    return () => cancelFrame(animationFrame)
  }, [finishOrder, phase, runId, winnerCount])

  const timerCopy = phase === 'idle'
    ? '41 READY'
    : phase === 'countdown'
      ? '3 · 2 · 1'
      : phase === 'complete'
        ? '0.0 SEC'
        : `${RACE_DURATION_MS / 1000} SEC`

  return (
    <section className={`pinball-machine pinball-machine--${phase}`} aria-labelledby="pinball-title">
      <div className="machine-topbar">
        <div>
          <span className="machine-lights" aria-hidden="true"><i /><i /><i /></span>
          <span>LEADER FOLLOW CAMERA</span>
        </div>
        <div className="machine-state">
          <span className="round-timer" ref={timerElement}>{timerCopy}</span>
          <strong id="pinball-title">
            {phase === 'idle' && 'READY'}
            {phase === 'countdown' && 'GET READY'}
            {phase === 'running' && 'CAMERA LIVE'}
            {phase === 'complete' && 'COMPLETE'}
          </strong>
        </div>
      </div>

      <div className="pinball-stage">
        <svg
          ref={svgElement}
          viewBox={`0 0 ${BOARD_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label="선두 감자를 추적하는 세로형 핀볼 레이스 보드"
        >
          <defs>
            <radialGradient id="bumper-glow">
              <stop offset="0" stopColor="#ffe0a2" />
              <stop offset="0.56" stopColor="#f2a737" />
              <stop offset="1" stopColor="#9c4d16" />
            </radialGradient>
            <filter id="soft-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {PARTICIPANTS.map((number) => (
              <clipPath
                id={`potato-crop-${runId}-${number}`}
                clipPathUnits="userSpaceOnUse"
                key={`crop-${runId}-${number}`}
              >
                <rect x="-48" y="-52" width="96" height="104" />
              </clipPath>
            ))}
          </defs>

          <rect className="board-soil" x="10" y="10" width="740" height="4290" rx="28" fill="#3d2614" />
          <path className="board-vine board-vine--long" d="M32 210V36h110M728 210V36H618M32 205v4040M728 205v4040" />

          <g className="starting-rack" aria-hidden="true">
            <rect x="35" y="28" width="690" height="190" rx="16" />
            <text x="380" y="52" textAnchor="middle">01—41 · ALL POTATOES ON THE STARTING GRID</text>
            <path d="M48 224h664" />
            <path className="start-arrows" d="M330 229l18 16 18-16m28 0 18 16 18-16" />
          </g>

          <g className="course-markers" aria-hidden="true">
            {COURSE_MARKERS.map((y, index) => (
              <g transform={`translate(0 ${y})`} key={y}>
                <path d="M52 0h656" />
                <text x="64" y="-12">ZONE {String(index + 1).padStart(2, '0')}</text>
                <text x="696" y="-12" textAnchor="end">DEPTH {Math.round(y / FLOOR_Y * 100)}%</text>
              </g>
            ))}
          </g>

          <g className="peg-field" aria-hidden="true">
            {PEGS.map((peg, index) => peg.kind === 'bumper' ? (
              <g className="bumper" transform={`translate(${peg.x} ${peg.y})`} key={`bumper-${index}`}>
                <circle r="34" />
                <circle r="25" fill="url(#bumper-glow)" filter="url(#soft-glow)" />
                <path d="M-8-5h16M-8 5h16" />
              </g>
            ) : (
              <g className="peg" transform={`translate(${peg.x} ${peg.y})`} key={`peg-${index}`}>
                <circle r="15" />
                <circle r="8" />
              </g>
            ))}
          </g>

          <g className="finish-zone" aria-hidden="true">
            <rect x="35" y="3680" width="690" height="420" rx="24" />
            <text className="finish-zone__label" x="380" y="3820" textAnchor="middle">FINAL APPROACH</text>
            <path className="finish-zone__line" d="M55 3900h650" />
            {Array.from({ length: 20 }, (_, index) => (
              <rect
                className={index % 2 === 0 ? 'finish-check finish-check--light' : 'finish-check'}
                x={55 + index * 32.5}
                y="3885"
                width="32.5"
                height="30"
                key={index}
              />
            ))}
            <text className="finish-zone__title" x="380" y="3980" textAnchor="middle">GOAL</text>
          </g>

          <g className="potato-balls" aria-hidden="true">
            {PARTICIPANTS.map((number, index) => {
              const character = POTATO_CHARACTERS[index % POTATO_CHARACTERS.length]
              const scale = Math.min(96 / character.width, 104 / character.height)
              const imageX = -48 + (96 - character.width * scale) / 2 - character.x * scale
              const imageY = -52 + (104 - character.height * scale) / 2 - character.y * scale

              return (
                <g
                  className="potato-ball"
                  ref={(element) => {
                    if (element) {
                      ballElements.current.set(number, element)
                    } else {
                      ballElements.current.delete(number)
                    }
                  }}
                  key={`${runId}-${number}`}
                >
                  <ellipse className="potato-ball__shadow" cx="0" cy="37" rx="31" ry="9" />
                  <g clipPath={`url(#potato-crop-${runId}-${number})`}>
                    <rect className="potato-ball__backdrop" x="-48" y="-52" width="96" height="104" />
                    <image
                      className="potato-ball__sprite"
                      href={potatoWorld}
                      x={imageX}
                      y={imageY}
                      width={763 * scale}
                      height={958 * scale}
                    />
                  </g>
                  <g className="potato-headband">
                    <path className="potato-headband__tail" d="M-39-31l15 3v12l-16 6 5-10zm78 0-15 3v12l16 6-5-10z" />
                    <path className="potato-headband__band" d="M-25-38Q0-45 25-38l-2 25q-23-6-46 0z" />
                    <text className="potato-headband__number" x="0" y="-20" textAnchor="middle">{number}</text>
                  </g>
                </g>
              )
            })}
          </g>

          <g className="leader-marker" ref={leaderMarker} opacity="0" aria-hidden="true">
            <circle r="48" />
            <path d="M-57 0h18M39 0h18M0-57v18M0 39v18" />
          </g>
        </svg>

        {phase === 'running' && (
          <div className="camera-hud" aria-live="polite">
            <span>LIVE LEADER CAMERA</span>
            <strong ref={cameraLabel}>1위 추적 중</strong>
            <div><i ref={cameraProgress} /></div>
          </div>
        )}
        {phase === 'idle' && (
          <div className="board-callout board-callout--ready">
            <span>41 POTATOES</span>
            <strong>긴 코스의 출발선에서 모두 준비 완료</strong>
          </div>
        )}
        {phase === 'countdown' && (
          <div className="race-countdown" role="status" aria-label="3, 2, 1, 땅!">
            <span>3</span><span>2</span><span>1</span><span>땅!</span>
          </div>
        )}
        {phase === 'complete' && (
          <div className="board-complete" role="status">
            <span>WINNERS!</span>
            <strong>순위 감자가 차례대로 골인했습니다</strong>
          </div>
        )}
      </div>

      <div className="machine-footer" aria-hidden="true">
        <span>{PINBALL_DRAW_DURATION_MS / 1000} SEC ROUND</span>
        <span>LEADER LOCK CAMERA</span>
        <span>VERTICAL COURSE · 4300M</span>
      </div>
    </section>
  )
}
