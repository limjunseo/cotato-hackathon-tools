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

const G4 = 392.00
const A4 = 440.00
const B4 = 493.88
const C5 = 523.25
const D5 = 587.33
const E5 = 659.25
const F5 = 698.46
const G5 = 783.99

function playMusicBoxNote(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  startsAt: number,
  duration: number,
  volume: number,
) {
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(frequency, startsAt)
  
  gain.gain.setValueAtTime(0.0001, startsAt)
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.015)
  gain.gain.exponentialRampToValueAtTime(volume * 0.35, startsAt + 0.12)
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration)
  
  osc.connect(gain)
  gain.connect(output)
  osc.start(startsAt)
  osc.stop(startsAt + duration + 0.05)
}

export function playMergeNotificationAudio() {
  const audio = createOutput()
  if (!audio) return null

  const { context, output } = audio
  const now = context.currentTime + 0.03
  
  const beat = 0.22
  const shortNotes = [
    { f: G4, d: 0.5, start: 0 },
    { f: G4, d: 0.5, start: 0.5 },
    { f: A4, d: 1.0, start: 1.0 },
    { f: G4, d: 1.0, start: 2.0 },
    { f: C5, d: 1.0, start: 3.0 },
    { f: B4, d: 2.0, start: 4.0 },
  ]

  shortNotes.forEach((note) => {
    playMusicBoxNote(context, output, note.f, now + note.start * beat, note.d * beat, 0.18)
  })

  // Add a festive firecracker pop at the end
  playFirecrackerPop(context, output, now + 6.0 * beat, 0.22)

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

  // 2. Play the full "Happy Birthday/Congratulations" melody during the presentation
  const beatDuration = 0.35
  const notes = [
    // Phrase 1
    { f: G4, d: 0.5, start: 0 },
    { f: G4, d: 0.5, start: 0.5 },
    { f: A4, d: 1.0, start: 1.0 },
    { f: G4, d: 1.0, start: 2.0 },
    { f: C5, d: 1.0, start: 3.0 },
    { f: B4, d: 2.0, start: 4.0 },
    
    // Phrase 2
    { f: G4, d: 0.5, start: 6.0 },
    { f: G4, d: 0.5, start: 6.5 },
    { f: A4, d: 1.0, start: 7.0 },
    { f: G4, d: 1.0, start: 8.0 },
    { f: D5, d: 1.0, start: 9.0 },
    { f: C5, d: 2.0, start: 10.0 },
    
    // Phrase 3
    { f: G4, d: 0.5, start: 12.0 },
    { f: G4, d: 0.5, start: 12.5 },
    { f: G5, d: 1.0, start: 13.0 },
    { f: E5, d: 1.0, start: 14.0 },
    { f: C5, d: 1.0, start: 15.0 },
    { f: B4, d: 1.0, start: 16.0 },
    { f: A4, d: 2.0, start: 17.0 },
    
    // Phrase 4
    { f: F5, d: 0.5, start: 19.0 },
    { f: F5, d: 0.5, start: 19.5 },
    { f: E5, d: 1.0, start: 20.0 },
    { f: C5, d: 1.0, start: 21.0 },
    { f: D5, d: 1.0, start: 22.0 },
    { f: C5, d: 2.0, start: 23.0 },
  ]

  notes.forEach((note) => {
    const noteTime = note.start * beatDuration
    const elapsedSec = elapsedMs / 1000
    // Only play notes that are scheduled to start after the current playback position
    if (noteTime >= elapsedSec && noteTime < 10.5) {
      const scheduleTime = now + (noteTime - elapsedSec)
      playMusicBoxNote(context, output, note.f, scheduleTime, note.d * beatDuration, 0.16)
    }
  })

  // 3. Play secondary explosion and scattered cracker pops during the announcement phase
  if (elapsedMs < 4500) {
    const successAt = now + Math.max(0, 1200 - elapsedMs) / 1000
    
    // Play multiple celebratory firecracker pops in the background
    const popDelays = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2]
    popDelays.forEach((delay) => {
      playFirecrackerPop(context, output, successAt + delay, 0.15)
    })
    
    // Play a secondary firework explosion in the middle of announcement
    playExplosion(context, output, successAt + 0.5, 0.22)
  }

  // 4. Race phase: Keep original racer boost sawtooth tones
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
