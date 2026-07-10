type PotatoProps = {
  name: string
  compact?: boolean
}

export function Potato({ name, compact = false }: PotatoProps) {
  return (
    <div className={`pnd-potato ${compact ? 'pnd-potato--compact' : ''}`}>
      <div className="pnd-potato__body" aria-hidden="true">
        <i className="pnd-potato__spot pnd-potato__spot--one" />
        <i className="pnd-potato__spot pnd-potato__spot--two" />
        <i className="pnd-potato__spot pnd-potato__spot--three" />
        <span className="pnd-potato__face"><i /><i /><b /></span>
      </div>
      <strong className="pnd-potato__name">{name}</strong>
    </div>
  )
}
