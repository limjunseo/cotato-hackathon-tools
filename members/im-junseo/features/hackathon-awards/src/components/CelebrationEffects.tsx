type CelebrationEffectsProps = {
  intensity?: 'quiet' | 'full'
}

export function CelebrationEffects({ intensity = 'quiet' }: CelebrationEffectsProps) {
  const particleCount = intensity === 'full' ? 30 : 12

  return (
    <div className={`celebration celebration--${intensity}`} aria-hidden="true">
      <div className="celebration__rays" />
      <div className="celebration__stars">
        {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
      </div>
      <div className="celebration__confetti">
        {Array.from({ length: particleCount }, (_, index) => <i key={index} />)}
      </div>
    </div>
  )
}
