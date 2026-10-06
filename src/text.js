import story from './story/story.json'

// Story values can depend on what happened earlier:
//   { "by": "chased", "sport": "...", "music": "..." }       the plan Théo chased
//   { "by": "choice:1.9", "water": "...", "window": "..." }  an earlier choice
//   { "by": "quest:q1", "done": "...", "notyet": "..." }     a quest's status
//   { "by": "letter", "ready": "...", "waiting": "..." }     the sealed letter
// The first option is used when nothing matches yet.
export function keyFor(by, state) {
  if (by.startsWith('choice:')) return state.choices[by.slice(7)]
  if (by.startsWith('quest:')) return state.quests[by.slice(6)] ? 'done' : 'notyet'
  if (by === 'letter') return letterReady(state) ? 'ready' : 'waiting'
  return state[by]
}

export function resolve(value, state) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.by) return value
  const key = keyFor(value.by, state)
  if (key != null && value[key] != null) return value[key]
  const first = Object.keys(value).find((k) => k !== 'by')
  return first ? value[first] : null
}

export function pick(value, state) {
  const v = resolve(value, state)
  return v == null ? '' : String(v)
}

export const letterReady = (state) =>
  !!state.future_letter && state.future_letter.open_date <= todayISO()

// {tokens} inside any text:
//   {chased} {chasedObject} {chasedVerb}  from story.json "tokens"
//   {w:7.21}         what the player wrote on screen 7.21
//   {pocket1}        the first line Théo put in his pocket (5.4)
//   {map1} {map2}    items from the Who Is Théo? map
//   {before:film} {after:film}  awkwardness ratings
//   {letterDate}     the sealed letter's open date
export function fill(str, state, vars = {}) {
  return String(str).replace(/\{([\w:.-]+)\}/g, (m, name) => {
    if (name in vars) return vars[name]
    const table = story.tokens[name]
    if (table) return table[state.chased] ?? table.default ?? m
    const [kind, arg] = name.split(':')
    if (kind === 'w') return state.writes[arg]?.text?.trim() || '…'
    if (kind === 'pocket1') return state.pocket?.[0] || story.tokens.pocketDefault || '…'
    if (kind === 'map1') return state.who_is_theo[0]?.text || 'long walks'
    if (kind === 'map2') return state.who_is_theo[1]?.text || 'markets'
    if (kind === 'before' || kind === 'after') {
      const p = [...state.predictions].reverse().find((x) => x.key === arg && x.kind === kind)
      return p ? String(p.value) : '?'
    }
    if (kind === 'dedication') return story.dedication || ''
    if (kind === 'letterDate') return state.future_letter ? formatDate(state.future_letter.open_date) : '…'
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

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
