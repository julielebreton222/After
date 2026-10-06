import { story } from './story'
import { say } from './text'

// Splits a screen's words into "beats": one tap each. Sentences are grouped
// up to story.json "beatChars" characters, so short lines stay together.
// A line break ("\n") in the text always starts a new beat.
const MAX = story.beatChars || 80

export function sentences(text) {
  return text.match(/[^.!?…]+(?:[.!?…]+["”»)]*|$)\s*/g)?.map((s) => s.trim()).filter(Boolean) || [text]
}

export function buildBeats(words = [], state) {
  const beats = []
  for (const w of words) {
    const text = say(w.text, state)
    for (const part of text.split('\n')) {
      let cur = ''
      for (const s of sentences(part)) {
        if (cur && (cur + ' ' + s).length > MAX) {
          beats.push({ speaker: w.speaker, text: cur })
          cur = s
        } else {
          cur = cur ? `${cur} ${s}` : s
        }
      }
      if (cur) beats.push({ speaker: w.speaker, text: cur })
    }
  }
  return beats
}
