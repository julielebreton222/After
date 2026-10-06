// Checks the story files for mistakes after editing: duplicate ids, branches
// that point nowhere, unknown interaction types, lights missing from story.json.
// Run with: npm run check-story
import { readFileSync, readdirSync, existsSync } from 'node:fs'

const dir = new URL('../src/story/', import.meta.url)
const story = JSON.parse(readFileSync(new URL('story.json', dir)))
const TYPES = ['choice', 'tap-objects', 'write', 'timer', 'hold', 'drag', 'rate', 'critic-reply', 'quest', 'notebook', 'seal']
const problems = []
const screens = []

for (const f of readdirSync(dir).filter((f) => /^chapter-\d+\.json$/.test(f)).sort()) {
  let ch
  try { ch = JSON.parse(readFileSync(new URL(f, dir))) } catch (e) { problems.push(`${f}: not valid JSON (${e.message})`); continue }
  for (const s of ch.screens) screens.push({ ...s, file: f })
}

const ids = new Set()
for (const s of screens) {
  const at = `${s.file} ${s.id}`
  if (ids.has(s.id)) problems.push(`${at}: duplicate id`)
  ids.add(s.id)
  if (!s.image) problems.push(`${at}: no image description`)
  if (s.light && !story.lights[s.light]) problems.push(`${at}: light "${s.light}" is not listed in story.json "lights"`)
  for (const p of s.points || []) if (!story.lights[p]) problems.push(`${at}: point "${p}" is not listed in story.json "lights"`)
  const arts = s.art && typeof s.art === 'object' ? Object.entries(s.art).filter(([k]) => k !== 'by').map(([, v]) => v) : [s.art]
  for (const a of arts) {
    if (a && a !== 'black' && !existsSync(new URL(`../public/images/${a}.jpg`, import.meta.url))) problems.push(`${at}: painting "${a}" not found (public/images/${a}.jpg)`)
  }
  const i = s.interaction
  if (i && !TYPES.includes(i.type)) problems.push(`${at}: unknown interaction type "${i.type}"`)
}
for (const s of screens) {
  const at = `${s.file} ${s.id}`
  const targets = [s.next, s.interaction?.continueTo, ...(s.interaction?.options || []).map((o) => o.goto)].filter(Boolean)
  for (const t of targets) if (!ids.has(t)) problems.push(`${at}: goes to "${t}", which doesn't exist`)
}

if (problems.length) {
  console.error(`Found ${problems.length} problem(s):\n- ` + problems.join('\n- '))
  process.exit(1)
}
console.log(`Story OK: ${screens.length} screens.`)
