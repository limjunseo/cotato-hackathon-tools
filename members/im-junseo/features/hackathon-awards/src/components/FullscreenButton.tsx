type FullscreenButtonProps = {
  isFullscreen: boolean
  onToggle: () => void
}

export function FullscreenButton({ isFullscreen, onToggle }: FullscreenButtonProps) {
  return (
    <button
      className="awards-utility-button"
      type="button"
      aria-label={isFullscreen ? '전체화면 종료' : '전체화면으로 보기'}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isFullscreen ? '⊟' : '⊞'}</span>
      {isFullscreen ? 'EXIT STAGE' : 'FULL SCREEN'}
    </button>
  )
}
