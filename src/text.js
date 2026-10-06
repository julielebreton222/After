import { story } from './story'

// A text value in the story files is either a plain string, or an object that
// picks a version from saved state, e.g. { "by": "chased", "sport": "...", ... }
// or { "by": "choice:1.9", "water": "...", ... }.
export function pick(value, state) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  const by = value.by || ''
  const key = by.startsWith('choice:') ? state.choices[by.slice(7)] : state[by]
  if (key != null && value[key] != null) return value[key]
  const first = Object.keys(value).find((k) => k !== 'by')
  return first ? value[first] : ''
}

// Replaces {tokens}: story tokens ({chased}, {chasedObject}) use saved
// state; anything else comes from `vars`.
export function fill(str, state, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (m, name) => {
    if (name in vars) return vars[name]
    const table = story.tokens[name]
    if (table) return table[state.chased] ?? m
    return m
  })
}

export const say = (value, state, vars) => fill(pick(value, state), state, vars)

export const T = story.text

export function formatDate(iso) {
  return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

// Like pick(), for any value (arrays, objects): { "by": ..., "<option>": value }.
export function resolve(value, state) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.by) return value
  const by = value.by
  const key = by.startsWith('choice:') ? state.choices[by.slice(7)] : state[by]
  if (key != null && value[key] != null) return value[key]
  const first = Object.keys(value).find((k) => k !== 'by')
  return first ? value[first] : null
}
