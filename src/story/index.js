// Loads the story data. Each chapter is one file: chapter-1.json ... chapter-9.json.
import story from './story.json'
import { resolve } from '../text'

const files = import.meta.glob('./chapter-*.json', { eager: true, import: 'default' })
export const chapters = Object.values(files).sort((a, b) => a.number - b.number)
export { story }

export const screens = chapters.flatMap((ch) =>
  ch.screens.map((s) => ({ ...s, chapter: ch.number }))
)
export const byId = Object.fromEntries(screens.map((s) => [s.id, s]))
const order = Object.fromEntries(screens.map((s, i) => [s.id, i]))

// "next" can be a screen id, or depend on state like any other value:
// { "by": "letter", "ready": "9.12", "waiting": "9.15" }.
export function nextId(id, state) {
  const s = byId[id]
  if (!s) return null
  if (s.next) return state ? resolve(s.next, state) : typeof s.next === 'string' ? s.next : null
  const n = screens[order[id] + 1]
  return n ? n.id : null
}

// A screen's interactions as a list, each with its own id for saving:
// the first keeps the screen id ("3.30"), the next ones get ":2", ":3".
export function itemsOf(screen) {
  const raw = screen.interaction
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : [raw]
  return list.map((cfg, i) => ({ cfg, id: i === 0 ? screen.id : `${screen.id}:${i + 1}` }))
}

export function chapterData(number) {
  return chapters.find((c) => c.number === number) || null
}

export function questScreens() {
  return screens.flatMap((s) => itemsOf(s).filter((it) => it.cfg.type === 'quest').map((it) => ({ ...s, interaction: it.cfg })))
}

// Chapter 1 is always open. Later chapters open when the quest that
// "unlocks" them is done.
export function isChapterUnlocked(number, state) {
  if (number === 1) return true
  const q = questScreens().find((s) => s.interaction.unlocks === number)
  const r = q && state.quests[q.interaction.id]
  return !!(r && !r.partial)
}
