// Loads the story data. To add a chapter: create chapter-N.json next to this
// file and add it to the list below.
import story from './story.json'
import chapter1 from './chapter-1.json'

export const chapters = [chapter1]
export { story }

export const screens = chapters.flatMap((ch) =>
  ch.screens.map((s) => ({ ...s, chapter: ch.number }))
)
export const byId = Object.fromEntries(screens.map((s) => [s.id, s]))
const order = Object.fromEntries(screens.map((s, i) => [s.id, i]))

export function nextId(id) {
  const s = byId[id]
  if (!s) return null
  if (s.next) return s.next
  const n = screens[order[id] + 1]
  return n ? n.id : null
}

export function chapterData(number) {
  return chapters.find((c) => c.number === number) || null
}

export function questScreens() {
  return screens.filter((s) => s.interaction?.type === 'quest')
}

// Chapter 1 is always open. Later chapters open when the quest that
// "unlocks" them is done.
export function isChapterUnlocked(number, state) {
  if (number === 1) return true
  const q = questScreens().find((s) => s.interaction.unlocks === number)
  return !!(q && state.quests[q.interaction.id])
}
