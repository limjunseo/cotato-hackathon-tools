import type { AwardRank } from '../types'

type PotatoMascotProps = {
  rank: AwardRank
  compact?: boolean
}

const EXPRESSIONS = {
  1: { mouth: 'M74 112q26 28 52 0', eyeY: 83 },
  2: { mouth: 'M78 113q22 18 44 0', eyeY: 86 },
  3: { mouth: 'M82 115q18 12 36 0', eyeY: 88 },
} as const

export function PotatoMascot({ rank, compact = false }: PotatoMascotProps) {
  const expression = EXPRESSIONS[rank]
  const label = `${rank}등 감자 마스코트`

  return (
    <svg
      className={`potato-mascot potato-mascot--rank-${rank} ${compact ? 'potato-mascot--compact' : ''}`}
      viewBox="0 0 200 230"
      role="img"
      aria-label={label}
    >
      <ellipse className="potato-mascot__shadow" cx="100" cy="207" rx="62" ry="13" />
      <path className="potato-mascot__leaf potato-mascot__leaf--left" d="M97 40C67 36 61 15 62 4c23 2 40 14 43 35" />
      <path className="potato-mascot__leaf potato-mascot__leaf--right" d="M103 40c24-11 36-28 34-39-21 3-34 15-40 38" />
      {rank === 1 && (
        <g className="potato-mascot__crown">
          <path d="m58 47 10-28 22 19 14-31 15 31 23-19 3 31z" />
          <path d="M61 50h81v15H61z" />
          <circle cx="102" cy="48" r="5" />
        </g>
      )}
      {rank === 3 && (
        <g className="potato-mascot__headband">
          <path d="M44 70q56-23 112 0l-6 22Q100 74 50 92z" />
          <path d="m150 72 35 4-19 15 17 15-38-7z" />
          <text x="100" y="82" textAnchor="middle">03</text>
        </g>
      )}
      <path
        className="potato-mascot__body"
        d="M53 66c19-24 72-29 93-2 17 22 18 91-1 118-19 27-74 31-96 2-19-25-14-95 4-118Z"
      />
      <path className="potato-mascot__highlight" d="M67 72c-14 20-16 67-2 86" />
      <circle className="potato-mascot__spot" cx="130" cy="70" r="5" />
      <circle className="potato-mascot__spot" cx="57" cy="140" r="4" />
      <circle className="potato-mascot__spot" cx="139" cy="151" r="3" />
      <g className="potato-mascot__neck-medal">
        <path className="potato-mascot__ribbon" d="M67 103 91 145M133 103l-24 42" />
        <path className="potato-mascot__ribbon-edge" d="m91 145 9-15 9 15" />
        <circle className="potato-mascot__medal-disc" cx="100" cy="151" r="20" />
        <circle className="potato-mascot__medal-inner" cx="100" cy="151" r="14" />
        <text x="100" y="158" textAnchor="middle">{rank}</text>
      </g>
      <g className="potato-mascot__face">
        <ellipse cx="78" cy={expression.eyeY} rx="7" ry="10" />
        <ellipse cx="122" cy={expression.eyeY} rx="7" ry="10" />
        <circle className="potato-mascot__eye-light" cx="80" cy={expression.eyeY - 3} r="2" />
        <circle className="potato-mascot__eye-light" cx="124" cy={expression.eyeY - 3} r="2" />
        <path d={expression.mouth} />
        <ellipse className="potato-mascot__cheek" cx="62" cy="111" rx="10" ry="5" />
        <ellipse className="potato-mascot__cheek" cx="138" cy="111" rx="10" ry="5" />
      </g>
      <path className="potato-mascot__arm" d="M50 122Q25 129 21 109" />
      <path className="potato-mascot__arm" d="M149 120q29-15 34-39" />
      <path className="potato-mascot__leg" d="m76 186-12 19" />
      <path className="potato-mascot__leg" d="m124 186 13 19" />
    </svg>
  )
}
