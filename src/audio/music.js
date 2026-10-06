// A calm soundscape generated live in the browser (no audio files):
// a soft low drone, gentle rain, and a sparse piano-like melody with reverb.
let ctx = null
let master = null
let reverb = null
let noteTimer = null
let playing = false
const VOLUME = 0.55

// A minor pentatonic, low and middle registers.
const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]

function impulse(seconds = 3.2) {
  const rate = ctx.sampleRate
  const buf = ctx.createBuffer(2, rate * seconds, rate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6)
  }
  return buf
}

function build() {
  const AC = window.AudioContext || window.webkitAudioContext
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  reverb = ctx.createConvolver()
  reverb.buffer = impulse()
  const wet = ctx.createGain()
  wet.gain.value = 0.45
  reverb.connect(wet).connect(master)

  // Drone: two slightly detuned low tones, slowly breathing.
  const droneFilter = ctx.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 420
  const droneGain = ctx.createGain()
  droneGain.gain.value = 0.05
  droneFilter.connect(droneGain).connect(master)
  droneGain.connect(reverb)
  for (const [f, detune] of [[110, 0], [110, 6], [164.81, -4]]) {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.detune.value = detune
    o.connect(droneFilter)
    o.start()
  }
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 0.02
  lfo.connect(lfoGain).connect(droneGain.gain)
  lfo.start()

  // Rain: filtered noise.
  const len = ctx.sampleRate * 3
  const noise = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = noise.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.04 * white) / 1.04 // brownish
    d[i] = last * 3 + white * 0.15
  }
  const rain = ctx.createBufferSource()
  rain.buffer = noise
  rain.loop = true
  const rainFilter = ctx.createBiquadFilter()
  rainFilter.type = 'bandpass'
  rainFilter.frequency.value = 900
  rainFilter.Q.value = 0.4
  const rainGain = ctx.createGain()
  rainGain.gain.value = 0.06
  rain.connect(rainFilter).connect(rainGain).connect(master)
  rain.start()
}

function note(freq, when, velocity = 0.12) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(velocity, when + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, when + 4.5)
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 1800
  for (const [mult, type, level] of [[1, 'triangle', 1], [2, 'sine', 0.25], [3, 'sine', 0.08]]) {
    const o = ctx.createOscillator()
    const og = ctx.createGain()
    o.type = type
    o.frequency.value = freq * mult
    og.gain.value = level
    o.connect(og).connect(g)
    o.start(when)
    o.stop(when + 4.6)
  }
  g.connect(f)
  f.connect(master)
  f.connect(reverb)
}

function loop() {
  if (!playing) return
  const t = ctx.currentTime + 0.05
  const i = Math.floor(Math.random() * SCALE.length)
  note(SCALE[i], t, 0.09 + Math.random() * 0.05)
  if (Math.random() < 0.3) note(SCALE[Math.max(0, i - 2)], t + 0.35 + Math.random() * 0.4, 0.07)
  noteTimer = setTimeout(loop, 2600 + Math.random() * 4200)
}

export function startMusic() {
  if (!ctx) build()
  ctx.resume?.()
  const t = ctx.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.setTargetAtTime(VOLUME, t, 1.2)
  if (!playing) {
    playing = true
    loop()
  }
}

export function stopMusic() {
  if (!ctx) return
  playing = false
  clearTimeout(noteTimer)
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
}

// Softer while a line is being read aloud.
export function duck(on) {
  if (!ctx || !playing) return
  master.gain.setTargetAtTime(on ? VOLUME * 0.4 : VOLUME, ctx.currentTime, 0.3)
}

// Pause when the app is in the background; resume when it's back.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend?.()
    else if (playing) ctx.resume?.()
  })
}
