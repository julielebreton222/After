// Writes narration/recording-script.md: every line of the story, in order,
// with the file name its recording should have. Record each line, save it as
// narration/recordings/<file>.mp3 (or .m4a), and the app plays it instead of
// the phone's voice. Run with: npm run narration-script
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const dir = new URL('../src/story/', import.meta.url)
const story = JSON.parse(readFileSync(new URL('story.json', dir)))
const MAX = story.beatChars || 80

// Same rules as the app (src/beats.js and src/audio/voice.js).
const sentences = (t) => t.match(/[^.!?…]+(?:[.!?…]+["”»)]*|$)\s*/g)?.map((s) => s.trim()).filter(Boolean) || [t]
function beats(text) {
  const out = []
  for (const part of text.split('\n')) {
    let cur = ''
    for (const s of sentences(part)) {
      if (cur && (cur + ' ' + s).length > MAX) { out.push(cur); cur = s } else cur = cur ? `${cur} ${s}` : s
    }
    if (cur) out.push(cur)
  }
  return out
}
function lineId(text) {
  let h = 0x811c9dc5
  for (const ch of text.normalize('NFC')) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0')
}
const PLAYER = /\{(w:|pocket1|map1|map2|before:|after:|letterDate)/
function variants(text) {
  // Expand the plan Théo chased into its four versions.
  if (!/\{chased/.test(text)) return [[null, text.replace('{dedication}', story.dedication || '')]]
  return ['sport', 'music', 'degree', 'business'].map((c) => [c, text.replace(/\{(chased\w*)\}/g, (m, k) => story.tokens[k]?.[c] ?? m)])
}

const files = readdirSync(dir).filter((f) => /^chapter-\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8)))
let md = `# After: recording script\n\nRecord each line below and save it as \`narration/recordings/<file>.mp3\` (or \`.m4a\`). The app plays your recording when "Read aloud" is on, and uses the phone's voice for any line without one. If you change a line's words, run \`npm run narration-script\` again: the file name changes with the words.\n\nLines marked *(player's words)* include something the player wrote, so they're always read by the phone's voice.\n\n`
let count = 0
const seen = new Set()
for (const f of files) {
  const ch = JSON.parse(readFileSync(new URL(f, dir)))
  md += `\n## Chapter ${ch.number}: ${ch.title}\n\n| File | Screen | Who | Line |\n| --- | --- | --- | --- |\n`
  for (const s of ch.screens) {
    for (const w of s.words || []) {
      const texts = typeof w.text === 'string' ? [w.text] : Object.entries(w.text).filter(([k]) => k !== 'by').map(([, v]) => v)
      for (const t of texts) {
        for (const [chased, full] of variants(t)) {
          for (const b of beats(full)) {
            const who = w.speaker === 'narrator' ? 'Narrator' : w.speaker
            const tag = chased ? ` *(if he chased ${chased})*` : ''
            if (PLAYER.test(b)) { md += `| (phone voice) | ${s.id} | ${who} | ${b.replace(/\|/g, '\\|')} *(player's words)* |\n`; continue }
            const id = lineId(b)
            if (seen.has(id)) continue
            seen.add(id)
            count++
            md += `| \`${id}\` | ${s.id} | ${who} | ${b.replace(/\|/g, '\\|')}${tag} |\n`
          }
        }
      }
    }
  }
}
writeFileSync(new URL('../narration/recording-script.md', import.meta.url), md)
console.log(`Wrote narration/recording-script.md: ${count} lines to record.`)
