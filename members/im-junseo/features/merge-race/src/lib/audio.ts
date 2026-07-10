type AudioWindow = Window & {
  __cotatoMergeAudioContext?: AudioContext
  webkitAudioContext?: typeof AudioContext
}

function tone(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  startsAt: number,
  duration: number,
  volume: number,
  type: OscillatorType,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startsAt)
  gain.gain.setValueAtTime(0.0001, startsAt)
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration)
  oscillator.connect(gain)
  gain.connect(output)
  oscillator.start(startsAt)
  oscillator.stop(startsAt + duration + 0.03)
}

function createOutput() {
  const audioWindow = window as AudioWindow
  const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext
  if (!AudioContextClass) return null

  const context = audioWindow.__cotatoMergeAudioContext ?? new AudioContextClass()
  audioWindow.__cotatoMergeAudioContext = context
  const output = context.createGain()
  output.gain.value = 0.09
  output.connect(context.destination)
  void context.resume().catch(() => undefined)

  return { context, output }
}

function stopOutput(context: AudioContext, output: GainNode) {
  output.gain.setTargetAtTime(0.0001, context.currentTime, 0.04)
  window.setTimeout(() => output.disconnect(), 160)
}

export function playMergeNotificationAudio() {
  const audio = createOutput()
  if (!audio) return null

  const { context, output } = audio
  const now = context.currentTime + 0.03
  tone(context, output, 659.25, now, 0.13, 0.18, 'square')
  tone(context, output, 880, now + 0.12, 0.16, 0.2, 'square')
  tone(context, output, 1_046.5, now + 0.26, 0.24, 0.2, 'triangle')

  return () => stopOutput(context, output)
}

export function playPresentationAudio(elapsedMs: number) {
  const audio = createOutput()
  if (!audio) return null

  const { context, output } = audio
  const now = context.currentTime + 0.03

  if (elapsedMs < 1_200) {
    tone(context, output, 880, now, 0.12, 0.2, 'square')
    tone(context, output, 1_320, now + 0.14, 0.22, 0.22, 'square')
  }
  if (elapsedMs < 4_500) {
    const successAt = now + Math.max(0, 1_200 - elapsedMs) / 1_000
    ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
      tone(context, output, frequency, successAt + index * 0.11, 0.18, 0.16, 'triangle')
    })
  }
  if (elapsedMs < 10_500) {
    const boostAt = now + Math.max(0, 4_500 - elapsedMs) / 1_000
    ;[196, 293.66, 440].forEach((frequency, index) => {
      tone(context, output, frequency, boostAt + index * 0.08, 0.2, 0.14, 'sawtooth')
    })
  }

  return () => {
    stopOutput(context, output)
  }
}
