// Rewrites the story files with small objects kept on one line, so they stay
// easy to read and edit. Run with: npm run format-story
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const dir = new URL('../src/story/', import.meta.url)

function fmt(v, indent = '') {
  const one = JSON.stringify(v)
  const flat = one.replace(/":/g, '": ').replace(/,"/g, ', "').replace(/^\{"/, '{ "').replace(/"\}$/, '" }').replace(/(\d|true|false|null)\}$/, '$1 }')
  if (typeof v !== 'object' || v === null) return one
  const simple = Array.isArray(v) ? v.every((x) => typeof x !== 'object' || x === null) : Object.values(v).every((x) => typeof x !== 'object' || x === null)
  if (simple && flat.length + indent.length <= 140) return flat
  const inner = indent + '  '
  if (Array.isArray(v)) return `[\n${v.map((x) => inner + fmt(x, inner)).join(',\n')}\n${indent}]`
  return `{\n${Object.entries(v).map(([k, x]) => `${inner}${JSON.stringify(k)}: ${fmt(x, inner)}`).join(',\n')}\n${indent}}`
}

for (const f of readdirSync(dir).filter((f) => /^chapter-\d+\.json$/.test(f))) {
  const url = new URL(f, dir)
  writeFileSync(url, fmt(JSON.parse(readFileSync(url, 'utf8'))) + '\n')
  console.log('formatted', f)
}
