import { useEffect } from 'react'

type MergeAudioWindow = Window & {
  __cotatoMergeAudioContext?: AudioContext
  webkitAudioContext?: typeof AudioContext
}

export function useMergeRaceAudioUnlock() {
  useEffect(() => {
    const unlock = () => {
      const audioWindow = window as MergeAudioWindow
      const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext
      if (!AudioContextClass) return

      const context = audioWindow.__cotatoMergeAudioContext ?? new AudioContextClass()
      audioWindow.__cotatoMergeAudioContext = context
      void context.resume().catch(() => undefined)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])
}
