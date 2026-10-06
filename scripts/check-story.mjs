// Checks the story files for mistakes after editing: duplicate ids, branches
// that point nowhere, unknown interaction types, lights missing from
// story.json. Missing paintings are listed as warnings (the screen shows its
// description instead). Run with: npm run check-story
import { readFileSync, readdirSync, existsSync } from 'node:fs'

const dir = new URL('../src/story/', import.meta.url)
const story = JSON.parse(readFileSync(new URL('story.json', dir)))
const TYPES = ['choice', 'tap-objects', 'write', 'timer', 'hold', 'drag', 'rate', 'critic-reply', 'quest', 'notebook', 'seal', 'map', 'places', 'notebook-browse']
const problems = []
const warnings = []
const screens = []

for (const f of readdirSync(dir).filter((f) => /^chapter-\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8)))) {
  let ch
  try { ch = JSON.parse(readFileSync(new URL(f, dir))) } catch (e) { problems.push(`${f}: not valid JSON (${e.message})`); continue }
  for (const s of ch.screens) screens.push({ ...s, file: f })
}

const options = (v) => (v && typeof v === 'object' && !Array.isArray(v) && v.by ? Object.entries(v).filter(([k]) => k !== 'by').map(([, x]) => x) : [v])
const ids = new Set()
for (const s of screens) {
  const at = `${s.file} ${s.id}`
  if (ids.has(s.id)) problems.push(`${at}: duplicate id`)
  ids.add(s.id)
  if (!s.image) problems.push(`${at}: no image description`)
  if (s.light && !story.lights[s.light]) problems.push(`${at}: light "${s.light}" is not listed in story.json "lights"`)
  for (const p of s.points || []) if (!story.lights[p]) problems.push(`${at}: point "${p}" is not listed in story.json "lights"`)
  for (const a of options(s.art)) {
    if (a && a !== 'black' && !existsSync(new URL(`../public/images/${a}.jpg`, import.meta.url))) warnings.push(`${at}: painting "${a}" not made yet`)
  }
  const items = s.interaction ? (Array.isArray(s.interaction) ? s.interaction : [s.interaction]) : []
  for (const i of items) if (!TYPES.includes(i.type)) problems.push(`${at}: unknown interaction type "${i.type}"`)
}
for (const s of screens) {
  const at = `${s.file} ${s.id}`
  const items = s.interaction ? (Array.isArray(s.interaction) ? s.interaction : [s.interaction]) : []
  const targets = [...options(s.next), ...items.flatMap((i) => [i.continueTo, ...(i.options || []).map((o) => o.goto)])].filter(Boolean)
  for (const t of targets) if (!ids.has(t)) problems.push(`${at}: goes to "${t}", which doesn't exist`)
}

if (warnings.length) console.warn(`${warnings.length} warning(s):\n- ` + warnings.join('\n- '))
if (problems.length) {
  console.error(`Found ${problems.length} problem(s):\n- ` + problems.join('\n- '))
  process.exit(1)
}
console.log(`Story OK: ${screens.length} screens.`)
