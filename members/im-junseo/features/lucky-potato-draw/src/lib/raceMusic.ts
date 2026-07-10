type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

export type RaceMusicSession = {
  stop: () => void
}

const BEAT_SECONDS = 0.16
const LOOP_BEATS = 16
const LOOP_SECONDS = BEAT_SECONDS * LOOP_BEATS
const MELODY = [
  587.33, 698.46, 880.00, 698.46, // D5, F5, A5, F5
  783.99, 880.00, 932.33, 880.00, // G5, A5, Bb5, A5
  698.46, 783.99, 880.00, 783.99, // F5, G5, A5, G5
  587.33, 659.25, 698.46, 554.37, // D5, E5, F5, C#5 (긴장감)
]
const BASS = [
  146.83, 146.83, 174.61, 196.00, // D3, D3, F3, G3
  220.00, 220.00, 233.08, 110.00, // A3, A3, Bb3, A2
]

function scheduleTone(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(output)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.03)
}

export function playRaceMusic(): RaceMusicSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextClass = window.AudioContext
    ?? (window as AudioWindow).webkitAudioContext
  if (!AudioContextClass) {
    return null
  }

  const context = new AudioContextClass()
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, context.currentTime)
  master.gain.exponentialRampToValueAtTime(0.30, context.currentTime + 0.08)
  master.connect(context.destination)
  void context.resume().catch(() => undefined)

  let stopped = false
  let nextLoopAt = context.currentTime + 0.04

  const scheduleLoop = (startAt: number) => {
    MELODY.forEach((frequency, index) => {
      scheduleTone(
        context,
        master,
        frequency,
        startAt + index * BEAT_SECONDS,
        BEAT_SECONDS * 0.72,
        'square',
        index % 4 === 0 ? 0.38 : 0.28,
      )
    })

    BASS.forEach((frequency, index) => {
      scheduleTone(
        context,
        master,
        frequency,
        startAt + index * BEAT_SECONDS * 2,
        BEAT_SECONDS * 1.55,
        'triangle',
        0.33,
      )
    })

    Array.from({ length: 8 }, (_, index) => index).forEach((index) => {
      scheduleTone(
        context,
        master,
        index % 4 === 0 ? 1_760 : 1_320,
        startAt + index * BEAT_SECONDS * 2,
        0.035,
        'square',
        index % 4 === 0 ? 0.15 : 0.09,
      )
    })
  }

  const queueMusic = () => {
    while (!stopped && nextLoopAt < context.currentTime + LOOP_SECONDS * 1.25) {
      scheduleLoop(nextLoopAt)
      nextLoopAt += LOOP_SECONDS
    }
  }

  queueMusic()
  const scheduler = window.setInterval(queueMusic, 900)

  return {
    stop: () => {
      if (stopped) {
        return
      }

      stopped = true
      window.clearInterval(scheduler)
      const stopAt = context.currentTime
      master.gain.cancelScheduledValues(stopAt)
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), stopAt)
      master.gain.exponentialRampToValueAtTime(0.0001, stopAt + 0.18)
      window.setTimeout(() => void context.close().catch(() => undefined), 220)
    },
  }
}
