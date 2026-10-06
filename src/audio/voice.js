import { story } from '../story'
import { LANG } from '../locale'

// Reads lines aloud with the phone's built-in voice (Web Speech API).
// Per-speaker pitch and rate come from story.json "voices".
let audio = null
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
let chosen = null

export const voiceSupported = !!synth

function pickVoice() {
  if (chosen || !synth) return chosen
  const voices = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith(LANG))
  const prefer = story.voicePreference || []
  chosen =
    prefer.map((name) => voices.find((v) => v.name.includes(name))).find(Boolean) ||
    voices.find((v) => v.localService) ||
    voices[0] ||
    null
  return chosen
}
synth?.addEventListener?.('voiceschanged', () => { chosen = null; pickVoice() })

export function speak(text, speaker, { onStart, onEnd } = {}) {
  if (!synth || !text) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const v = pickVoice()
  if (v) { u.voice = v; u.lang = v.lang } else u.lang = LANG === 'fr' ? 'fr-FR' : 'en-GB'
  const style = story.voices?.[speaker] || story.voices?.narrator || {}
  u.rate = style.rate ?? 0.92
  u.pitch = style.pitch ?? 1
  u.onstart = () => onStart?.()
  u.onend = u.onerror = () => onEnd?.()
  synth.speak(u)
}

export function stopSpeaking() {
  synth?.cancel()
  if (typeof audio !== 'undefined' && audio) { audio.pause(); audio = null }
}

// ---------- Recorded narration ----------
// Real recordings go in narration/recordings/<id>.mp3 (or .m4a), where <id>
// comes from the line's exact text: see narration/recording-script.md, made by
// `npm run narration-script`. They're bundled with the app when it's built.
// If a line's words change, its old recording stops matching and the phone's
// voice reads the new line instead.
const files = import.meta.glob('/narration/recordings/*.{mp3,m4a}', { eager: true, query: '?url', import: 'default' })
const recordings = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.(mp3|m4a)$/, ''), url])
)
export const hasRecordings = Object.keys(recordings).length > 0

export function lineId(text) {
  let h = 0x811c9dc5
  for (const ch of text.normalize('NFC')) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function speakLine(text, speaker, { onStart, onEnd } = {}) {
  stopSpeaking()
  const url = recordings[lineId(text)]
  if (!url) return speak(text, speaker, { onStart, onEnd })
  const a = new Audio(url)
  audio = a
  a.onplay = () => onStart?.()
  a.onended = () => onEnd?.()
  a.play().catch(() => { if (audio === a) speak(text, speaker, { onStart, onEnd }) })
}
