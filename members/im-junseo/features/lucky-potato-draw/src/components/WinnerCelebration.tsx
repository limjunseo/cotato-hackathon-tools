import potatoWorld from '../assets/potato-world.png'
import { POTATO_CHARACTERS } from '../lib/potatoCharacters'

type WinnerCelebrationProps = {
  participants: number[]
  winners: number[]
  onClose: () => void
}

type PotatoPortraitProps = {
  characterIndex: number
  number: number
}

function PotatoPortrait({ characterIndex, number }: PotatoPortraitProps) {
  const character = POTATO_CHARACTERS[characterIndex % POTATO_CHARACTERS.length]
  const scale = Math.min(116 / character.width, 124 / character.height)
  const imageX = -58 + (116 - character.width * scale) / 2 - character.x * scale
  const imageY = -62 + (124 - character.height * scale) / 2 - character.y * scale
  const cropId = `winner-potato-crop-${number}`

  return (
    <svg viewBox="-66 -74 132 148" role="img" aria-label={`${number}번 감자`}>
      <defs>
        <clipPath id={cropId} clipPathUnits="userSpaceOnUse">
          <rect x="-58" y="-62" width="116" height="124" rx="24" />
        </clipPath>
      </defs>
      <ellipse className="winner-potato__shadow" cx="0" cy="56" rx="42" ry="10" />
      <g clipPath={`url(#${cropId})`}>
        <rect className="winner-potato__backdrop" x="-58" y="-62" width="116" height="124" />
        <image
          className="winner-potato__sprite"
          href={potatoWorld}
          x={imageX}
          y={imageY}
          width={763 * scale}
          height={958 * scale}
        />
      </g>
      <g className="winner-headband">
        <path d="M-52-43l21 4v15l-22 8 7-13zm104 0-21 4v15l22 8-7-13z" />
        <path d="M-34-53Q0-62 34-53l-3 32q-31-8-62 0z" />
        <text x="0" y="-30" textAnchor="middle">{number}</text>
      </g>
    </svg>
  )
}

export function WinnerCelebration({ participants, winners, onClose }: WinnerCelebrationProps) {
  const [champion, ...otherWinners] = winners
  const getCharacterIndex = (number: number) => Math.max(0, participants.indexOf(number))

  if (champion === undefined) {
    return null
  }

  return (
    <section
      className="winner-celebration"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-celebration-title"
    >
      <div className="winner-celebration__rays" aria-hidden="true" />
      <div className="winner-confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
      </div>
      <button className="winner-close" type="button" onClick={onClose}>
        결과 닫기
      </button>

      <header className="winner-celebration__header">
        <span>RACE COMPLETE</span>
        <h2 id="winner-celebration-title">행운의 감자가<br />도착했습니다!</h2>
      </header>

      <div className="winner-showcase">
        <article className="winner-champion">
          <span className="winner-rank">01 · FIRST POTATO</span>
          <PotatoPortrait
            characterIndex={getCharacterIndex(champion)}
            number={champion}
          />
          <strong>#{champion}</strong>
          <small>오늘의 첫 번째 행운 감자</small>
        </article>

        {otherWinners.length > 0 && (
          <ol className="winner-runners" aria-label="나머지 당첨 순위">
            {otherWinners.map((number, index) => (
              <li key={number}>
                <span>{String(index + 2).padStart(2, '0')}</span>
                <PotatoPortrait
                  characterIndex={getCharacterIndex(number)}
                  number={number}
                />
                <strong>#{number}</strong>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="winner-celebration__note">
        먼저 골인한 순서대로 선정되었습니다
      </p>
    </section>
  )
}
