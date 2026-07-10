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

let cachedNoiseBuffer: AudioBuffer | null = null

function getNoiseBuffer(context: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer) return cachedNoiseBuffer
  const bufferSize = context.sampleRate * 2
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  cachedNoiseBuffer = buffer
  return buffer
}

function playWhistle(context: AudioContext, output: AudioNode, time: number, duration: number, volume: number) {
  const osc = context.createOscillator()
  const gain = context.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, time)
  osc.frequency.exponentialRampToValueAtTime(1500, time + duration)
  
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.linearRampToValueAtTime(volume, time + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
  
  osc.connect(gain)
  gain.connect(output)
  osc.start(time)
  osc.stop(time + duration + 0.05)
}

function playFirecrackerPop(context: AudioContext, output: AudioNode, time: number, volume: number) {
  // 1. White noise pop
  const noise = context.createBufferSource()
  noise.buffer = getNoiseBuffer(context)
  
  const filter = context.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1200
  
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06)
  
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(output)
  noise.start(time)
  noise.stop(time + 0.08)
  
  // 2. Mid/High pitch transient tone
  const osc = context.createOscillator()
  const oscGain = context.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(2000, time)
  osc.frequency.exponentialRampToValueAtTime(400, time + 0.04)
  
  oscGain.gain.setValueAtTime(0.0001, time)
  oscGain.gain.exponentialRampToValueAtTime(volume * 0.25, time + 0.002)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
  
  osc.connect(oscGain)
  oscGain.connect(output)
  osc.start(time)
  osc.stop(time + 0.05)
}

function playExplosion(context: AudioContext, output: AudioNode, time: number, volume: number) {
  // 1. Low frequency boom
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, time)
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.6)
  
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(volume * 0.9, time + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6)
  
  osc.connect(gain)
  gain.connect(output)
  osc.start(time)
  osc.stop(time + 0.655)
  
  // 2. Main blast noise
  const noise = context.createBufferSource()
  noise.buffer = getNoiseBuffer(context)
  
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 800
  filter.Q.value = 1.5
  
  const noiseGain = context.createGain()
  noiseGain.gain.setValueAtTime(0.0001, time)
  noiseGain.gain.exponentialRampToValueAtTime(volume * 0.6, time + 0.01)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45)
  
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(output)
  noise.start(time)
  noise.stop(time + 0.5)

  // 3. Scattered crackles
  for (let i = 0; i < 6; i++) {
    const delay = 0.2 + Math.random() * 0.3
    const popVolume = volume * (0.15 + Math.random() * 0.15)
    playFirecrackerPop(context, output, time + delay, popVolume)
  }
}

export function playMergeNotificationAudio() {
  const audio = createOutput()
  if (!audio) return null

  const { context, output } = audio
  const now = context.currentTime + 0.03
  
  // Festive firecracker pops in succession
  playFirecrackerPop(context, output, now, 0.25)
  playFirecrackerPop(context, output, now + 0.12, 0.22)
  playFirecrackerPop(context, output, now + 0.24, 0.18)

  return () => stopOutput(context, output)
}

export function playPresentationAudio(elapsedMs: number) {
  const audio = createOutput()
  if (!audio) return null

  const { context, output } = audio
  const now = context.currentTime + 0.03

  // 1. Detected phase: Whistle rocket and then a big firework explosion
  if (elapsedMs < 1200) {
    const whistleDuration = 0.7
    playWhistle(context, output, now, whistleDuration, 0.15)
    playExplosion(context, output, now + whistleDuration, 0.35)
  }

  // 2. Announcement phase: Successive crackles and secondary explosion
  if (elapsedMs < 4500) {
    const successAt = now + Math.max(0, 1200 - elapsedMs) / 1000
    
    // Play multiple celebratory firecracker pops
    const popDelays = [0, 0.18, 0.35, 0.45, 0.65, 0.8, 1.0, 1.25]
    popDelays.forEach((delay, index) => {
      const vol = 0.2 - (index * 0.01)
      playFirecrackerPop(context, output, successAt + delay, vol)
    })
    
    // Play a secondary firework explosion in the middle of announcement
    playExplosion(context, output, successAt + 0.5, 0.25)
  }

  // 3. Race phase: Keep original racer boost sawtooth tones
  if (elapsedMs < 10500) {
    const boostAt = now + Math.max(0, 4500 - elapsedMs) / 1000
    ;[196, 293.66, 440].forEach((frequency, index) => {
      tone(context, output, frequency, boostAt + index * 0.08, 0.2, 0.14, 'sawtooth')
    })
  }

  return () => {
    stopOutput(context, output)
  }
}
