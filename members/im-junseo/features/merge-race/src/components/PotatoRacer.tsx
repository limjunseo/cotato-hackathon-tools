import potatoWorld from '../assets/potato-world.png'

const POTATO_CHARACTERS = [
  { x: 102, y: 54, width: 128, height: 147 },
  { x: 320, y: 68, width: 139, height: 152 },
  { x: 513, y: 44, width: 153, height: 171 },
  { x: 88, y: 237, width: 135, height: 157 },
  { x: 271, y: 241, width: 169, height: 147 },
  { x: 432, y: 196, width: 132, height: 166 },
] as const

export function PotatoRacer({ teamId, teamName }: { teamId: number; teamName: string }) {
  const character = POTATO_CHARACTERS[(teamId - 1) % POTATO_CHARACTERS.length]
  const scale = Math.min(98 / character.width, 108 / character.height)
  const imageX = -49 + (98 - character.width * scale) / 2 - character.x * scale
  const imageY = -54 + (108 - character.height * scale) / 2 - character.y * scale
  const cropId = `merge-racer-crop-${teamId}`

  return (
    <svg className="potato-racer" viewBox="-58 -66 116 132" role="img" aria-label={`${teamName} 감자`}>
      <defs>
        <clipPath id={cropId} clipPathUnits="userSpaceOnUse">
          <rect x="-49" y="-54" width="98" height="108" rx="18" />
        </clipPath>
      </defs>
      <ellipse className="potato-racer__shadow" cx="0" cy="53" rx="38" ry="8" />
      <g clipPath={`url(#${cropId})`}>
        <rect className="potato-racer__backdrop" x="-49" y="-54" width="98" height="108" />
        <image
          className="potato-racer__sprite"
          href={potatoWorld}
          x={imageX}
          y={imageY}
          width={709 * scale}
          height={937 * scale}
        />
      </g>
      <g className="potato-racer__badge">
        <path d="M-31-51Q0-59 31-51l-3 25q-28-7-56 0z" />
        <text x="0" y="-33" textAnchor="middle">{teamId}</text>
      </g>
    </svg>
  )
}
