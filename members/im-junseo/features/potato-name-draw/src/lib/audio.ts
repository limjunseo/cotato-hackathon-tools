type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

export type MusicSession = { stop: () => void }

function getAudioContext(): AudioContext | null {
  const AudioContextConstructor = window.AudioContext
    ?? (window as AudioWindow).webkitAudioContext
  return AudioContextConstructor ? new AudioContextConstructor() : null
}

function tone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.03)
}

export function playShuffleMusic(): MusicSession | null {
  const context = getAudioContext()
  if (!context) return null

  const notes = [146.83, 174.61, 196, 174.61, 220, 196]
  let stopped = false
  let timer = 0

  const schedule = () => {
    if (stopped) return
    const now = context.currentTime + 0.03
    notes.forEach((frequency, index) => {
      tone(context, frequency, now + index * 0.22, 0.18, 0.035, 'triangle')
      tone(context, frequency / 2, now + index * 0.22, 0.12, 0.025, 'square')
    })
    timer = window.setTimeout(schedule, notes.length * 220)
  }

  schedule()
  return {
    stop: () => {
      stopped = true
      window.clearTimeout(timer)
      void context.close()
    },
  }
}

export function playLockSound() {
  const context = getAudioContext()
  if (!context) return
  const now = context.currentTime
  tone(context, 92, now, 0.5, 0.12, 'sawtooth')
  tone(context, 55, now + 0.16, 0.52, 0.16, 'square')
  window.setTimeout(() => void context.close(), 900)
}

export function playRevealSound(second = false) {
  const context = getAudioContext()
  if (!context) return
  const now = context.currentTime
  const notes = second ? [392, 523.25, 659.25] : [392, 523.25]
  notes.forEach((frequency, index) => tone(context, frequency, now + index * 0.09, 0.38, 0.08, 'triangle'))
  window.setTimeout(() => void context.close(), 1000)
}
