// Language, the hero's name and the hero's pronouns. All three are chosen in
// the introduction and applied to every text when the app loads, so changing
// one reloads the app.
//
// In the texts, {a|b|c} gives the form for he | she | they (English) or
// il | elle | iel (French): "{he|she|they} {walks|walks|walk}",
// "{fatigué|fatiguée|fatigué·e}". "Théo" is replaced by the hero's name.
const KEY = 'after-v1'
export const DEFAULT_HERO = 'Théo'
export const LANGS = ['en', 'fr']
export const PRONOUNS = ['he', 'she', 'they']

function saved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}
const s = saved()

export const LANG = LANGS.includes(s.lang) ? s.lang : 'en'
export const HERO = s.heroName?.trim() || DEFAULT_HERO
export const PRONOUN = PRONOUNS.includes(s.pronoun) ? s.pronoun : 'he'
const P = PRONOUNS.indexOf(PRONOUN)

const forms = /\{([^{}|]*)\|([^{}|]*)\|([^{}|]*)\}/g
export const localizeText = (str, p = P, hero = HERO) =>
  str.replace(forms, (m, ...f) => f[p]).replace(/Théo/g, hero)

// Applies the pronoun forms and the hero's name to every string (and key, for
// speaker voices) of a JSON object, in place.
export function localize(obj) {
  if (!obj || typeof obj !== 'object') return obj
  for (const k of Object.keys(obj)) {
    let v = obj[k]
    if (typeof v === 'string') v = localizeText(v)
    else localize(v)
    const nk = Array.isArray(obj) ? k : localizeText(k)
    if (nk !== k) delete obj[k]
    obj[nk] = v
  }
  return obj
}
