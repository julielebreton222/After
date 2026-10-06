// Checks the pronoun forms and the French translation.
//
//   node scripts/check-locale.mjs [base-dir] [file ...]
//
// For each English file:
//  - every {a|b|c} has exactly three forms (he | she | they);
//  - with "he" (the first form), the text is exactly the same as in
//    base-dir (the English before pronoun forms were added), if given.
// For each French file in src/locales/fr/:
//  - same structure as the English: same keys, same list lengths;
//  - ids, links, types and other non-text values are unchanged;
//  - placeholders like {chased} or {w:7.21} are kept;
//  - every {a|b|c} has exactly three forms (il | elle | iel).
import { readFileSync, existsSync } from 'node:fs'

const FILES = {
  'story.json': 'src/story/story.json',
  'toolkit.json': 'src/toolkit/toolkit.json',
  'habits.json': 'src/toolkit/habits.json',
  'quotes.json': 'src/toolkit/quotes.json',
  'night.json': 'src/night/night.json',
  'contact.json': 'src/contact.json',
}
for (let n = 1; n <= 9; n++) FILES[`chapter-${n}.json`] = `src/story/chapter-${n}.json`

// Values under these keys are not words to translate: they must stay identical.
const FIXED = new Set([
  'id', 'art', 'next', 'goto', 'type', 'key', 'by', 'saveAs', 'continueTo', 'light', 'haptic', 'layout',
  'unlock', 'unlocks', 'story', 'slug', 'style', 'for', 'every', 'email', 'glow', 'when', 'in', 'mode', 'subject',
  'speaker', 'number', 'showKept', 'showLightMap', 'showNotebook', 'showMap', 'showFriend', 'showChart',
  'showPeople', 'region', 'person', 'people', 'icon', 'beatChars', 'voicePreference', 'lightMapArt',
  'lightMapArtFinal', 'pick', 'safety', 'weekly', 'optional', 'checkins', 'hoursPerVisit', 'addToMap',
  'criticChange', 'criticSet', 'addHours', 'blackout', 'bloom', 'critic', 'anchor', 'x', 'y',
  'max', 'rows', 'seconds', 'from', 'videos', '_note', 'kind', 'book', 'frame', 'points', 'set', 'zone', 'correct', 'target', 'item',
])
// ...except these text fields, which can sit inside a fixed object.
const TEXT_INSIDE = new Set(['label', 'text', 'line', 'title', 'prompt', 'name', 'about', 'note'])

const problems = []
const forms3 = /\{[^{}|]*\|[^{}|]*\|[^{}|]*\}/g
const anyForms = /\{[^{}]*\|[^{}]*\}/g
const placeholders = (s) => (s.match(/\{[\w:.-]+\}/g) || []).sort().join(' ')
const resolveHe = (s) => s.replace(forms3, (m) => m.slice(1, -1).split('|')[0])

function checkForms(s, at) {
  for (const m of s.match(anyForms) || []) {
    if (m.split('|').length !== 3) problems.push(`${at}: "${m}" needs exactly three forms`)
  }
}

function walk(v, f) {
  if (typeof v === 'string') return f(v)
  if (Array.isArray(v)) return v.map((x) => walk(x, f))
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, f)]))
  return v
}

function eachString(v, path, f) {
  if (typeof v === 'string') return f(v, path)
  if (Array.isArray(v)) return v.forEach((x, i) => eachString(x, [...path, i], f))
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) eachString(x, [...path, k], f)
}

// Compares the French against the English, side by side.
function compare(en, fr, path, file, fixed) {
  const at = `${file} ${path.join('.')}`
  if (typeof en !== typeof fr || Array.isArray(en) !== Array.isArray(fr)) return problems.push(`${at}: different kind of value`)
  if (Array.isArray(en)) {
    if (en.length !== fr.length) return problems.push(`${at}: ${en.length} items in English, ${fr.length} in French`)
    return en.forEach((x, i) => compare(x, fr[i], [...path, i], file, fixed))
  }
  if (en && typeof en === 'object') {
    const a = Object.keys(en).sort().join(',')
    const b = Object.keys(fr).sort().join(',')
    if (a !== b) return problems.push(`${at}: keys differ (English: ${a} / French: ${b})`)
    for (const k of Object.keys(en)) {
      // story.json's interface texts ("text": the Next button…) are all words.
      const words = (file.endsWith('story.json') && ['text', 'predictionLabels'].includes(path[0] ?? k)) || path.includes('ui')
      compare(en[k], fr[k], [...path, k], file, !words && (FIXED.has(k) || (fixed && !TEXT_INSIDE.has(k))))
    }
    return
  }
  if (typeof en === 'string') {
    if (fixed && en !== fr) return problems.push(`${at}: must stay "${en}" (got "${fr}")`)
    checkForms(fr, at)
    if (placeholders(resolveHe(en)) !== placeholders(resolveHe(fr))) {
      problems.push(`${at}: placeholders differ (English: ${placeholders(en) || 'none'} / French: ${placeholders(fr) || 'none'})`)
    }
    return
  }
  if (en !== fr) problems.push(`${at}: must stay ${JSON.stringify(en)}`)
}

const [baseDir, ...only] = process.argv.slice(2)
for (const [name, path] of Object.entries(FILES)) {
  if (only.length && !only.includes(name)) continue
  const en = JSON.parse(readFileSync(path, 'utf8'))
  eachString(en, [], (s, p) => checkForms(s, `${path} ${p.join('.')}`))
  if (baseDir && existsSync(`${baseDir}/${name}`)) {
    const base = JSON.parse(readFileSync(`${baseDir}/${name}`, 'utf8'))
    const asHe = walk(en, resolveHe)
    eachString(base, [], (s, p) => {
      let v = asHe
      for (const k of p) v = v?.[k]
      if (v !== s) problems.push(`${path} ${p.join('.')}: with "he" it should read "${s}" but reads "${v}"`)
    })
    if (JSON.stringify(asHe) !== JSON.stringify(base) && !problems.some((x) => x.startsWith(path))) {
      problems.push(`${path}: with "he", the structure differs from the original`)
    }
  }
  const frPath = `src/locales/fr/${name}`
  if (existsSync(frPath)) compare(en, JSON.parse(readFileSync(frPath, 'utf8')), [], frPath, false)
}

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ` + problems.slice(0, 80).join('\n- '))
  process.exit(1)
}
console.log('Locale OK.')
