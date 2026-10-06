import { story } from '../story'

// Reads lines aloud with the phone's built-in voice (Web Speech API).
// Per-speaker pitch and rate come from story.json "voices".
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
let chosen = null

export const voiceSupported = !!synth

function pickVoice() {
  if (chosen || !synth) return chosen
  const voices = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('en'))
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
  if (v) { u.voice = v; u.lang = v.lang } else u.lang = 'en-GB'
  const style = story.voices?.[speaker] || story.voices?.narrator || {}
  u.rate = style.rate ?? 0.92
  u.pitch = style.pitch ?? 1
  u.onstart = () => onStart?.()
  u.onend = u.onerror = () => onEnd?.()
  synth.speak(u)
}

export function stopSpeaking() {
  synth?.cancel()
}
