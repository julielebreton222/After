// The hero's name. The story is written with "Théo"; on first launch the
// player can give the hero their own name (or any name). It's swapped into
// every text when the app loads, so changing it reloads the app.
const KEY = 'after-v1'
export const DEFAULT_HERO = 'Théo'

function saved() {
  try {
    return JSON.parse(localStorage.getItem(KEY))?.heroName?.trim() || ''
  } catch {
    return ''
  }
}

// The name the texts were renamed to when the app loaded.
export const HERO = saved() || DEFAULT_HERO

// Replaces "Théo" in every string (and key, for speaker voices) of a JSON
// object, in place.
export function renameHero(obj) {
  if (HERO === DEFAULT_HERO || !obj || typeof obj !== 'object') return obj
  const swap = (s) => s.replace(/Théo/g, HERO)
  for (const k of Object.keys(obj)) {
    let v = obj[k]
    if (typeof v === 'string') v = swap(v)
    else renameHero(v)
    const nk = Array.isArray(obj) ? k : swap(k)
    if (nk !== k) delete obj[k]
    obj[nk] = v
  }
  return obj
}
