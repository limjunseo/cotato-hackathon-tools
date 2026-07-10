type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

export type RaceMusicSession = {
  stop: () => void
}

const BEAT_SECONDS = 0.28
const LOOP_BEATS = 16
const LOOP_SECONDS = BEAT_SECONDS * LOOP_BEATS

const D2 = 73.42
const E2 = 82.41
const F2 = 87.31

const D4 = 293.66
const Eb4 = 311.13
const E4 = 329.63
const Fs4 = 369.99
const G4 = 392.00
const Gs4 = 415.30
const A4 = 440.00
const Bb4 = 466.16
const B4 = 493.88
const C5 = 523.25
const Cs5 = 554.37
const D5 = 587.33
const Eb5 = 622.25
const E5 = 659.25

const SUSPENSE_MELODY = [
  // Beat 0: D4, Eb4, D4, Eb4, Fs4 (딴!), G4 (따!)
  { f: D4, start: 0, d: 0.4 },
  { f: Eb4, start: 0.5, d: 0.4 },
  { f: D4, start: 1.0, d: 0.4 },
  { f: Eb4, start: 1.5, d: 0.4 },
  { f: Fs4, start: 2.0, d: 0.8 },
  { f: G4, start: 3.0, d: 1.2 },

  // Beat 4: D4, Eb4, D4, Eb4, Fs4 (딴!), G4 (따!)
  { f: D4, start: 4.0, d: 0.4 },
  { f: Eb4, start: 4.5, d: 0.4 },
  { f: D4, start: 5.0, d: 0.4 },
  { f: Eb4, start: 5.5, d: 0.4 },
  { f: Fs4, start: 6.0, d: 0.8 },
  { f: G4, start: 7.0, d: 1.2 },

  // Beat 8: Eb4, E4, Eb4, E4, Gs4 (딴!), A4 (따!)
  { f: Eb4, start: 8.0, d: 0.4 },
  { f: E4, start: 8.5, d: 0.4 },
  { f: Eb4, start: 9.0, d: 0.4 },
  { f: E4, start: 9.5, d: 0.4 },
  { f: Gs4, start: 10.0, d: 0.8 },
  { f: A4, start: 11.0, d: 1.2 },

  // Beat 12: Chromatic escalation (따-라-다-라-딴-딴-따!)
  { f: Bb4, start: 12.0, d: 0.4 },
  { f: B4, start: 12.5, d: 0.4 },
  { f: C5, start: 13.0, d: 0.4 },
  { f: Cs5, start: 13.5, d: 0.4 },
  { f: D5, start: 14.0, d: 0.4 },
  { f: Eb5, start: 14.5, d: 0.4 },
  { f: E5, start: 15.0, d: 0.9 },
]

const BASS_PULSES = [
  { f: D2, start: 0 },
  { f: D2, start: 0.5 },
  { f: D2, start: 2.0 },
  { f: D2, start: 2.5 },

  { f: D2, start: 4.0 },
  { f: D2, start: 4.5 },
  { f: D2, start: 6.0 },
  { f: D2, start: 6.5 },

  { f: E2, start: 8.0 },
  { f: E2, start: 8.5 },
  { f: E2, start: 10.0 },
  { f: E2, start: 10.5 },

  { f: F2, start: 12.0 },
  { f: F2, start: 12.5 },
  { f: F2, start: 14.0 },
  { f: F2, start: 14.5 },
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

function playClockTick(context: AudioContext, output: AudioNode, time: number, volume: number) {
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(2500, time)
  
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.012)
  
  osc.connect(gain)
  gain.connect(output)
  osc.start(time)
  osc.stop(time + 0.02)
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
  master.gain.exponentialRampToValueAtTime(0.35, context.currentTime + 0.08)
  master.connect(context.destination)
  void context.resume().catch(() => undefined)

  let stopped = false
  let nextLoopAt = context.currentTime + 0.04

  const scheduleLoop = (startAt: number) => {
    // 1. Play the suspenseful lead melody
    SUSPENSE_MELODY.forEach((note) => {
      scheduleTone(
        context,
        master,
        note.f,
        startAt + note.start * BEAT_SECONDS,
        note.d * BEAT_SECONDS,
        'square',
        0.14,
      )
    })

    // 2. Play the deep triangle bass heartbeat thuds
    BASS_PULSES.forEach((pulse) => {
      scheduleTone(
        context,
        master,
        pulse.f,
        startAt + pulse.start * BEAT_SECONDS,
        BEAT_SECONDS * 0.9,
        'triangle',
        0.24,
      )
    })

    // 3. Play clock ticking on every beat for extreme tension
    for (let i = 0; i < 16; i++) {
      playClockTick(
        context,
        master,
        startAt + i * BEAT_SECONDS,
        i % 4 === 0 ? 0.07 : 0.04,
      )
    }
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
