import { quotes as data } from './data'

// Quotes in three grieving styles (feel / hope / strength). The player picks
// a style on first launch; the app then shows quotes in that style.
export const quoteStyles = data.styles
export const quoteUi = data.ui
// One quote per style, shown side by side when choosing.
export const sampleQuotes = quoteStyles.map((s) => data.quotes.find((q) => q.style === s.id && q.pick))

const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

// A quote that fits a toolkit card (or "any" moment), always the same one
// for the same card and day, so it doesn't flicker.
export function quoteFor(state, moment = 'any') {
  const mine = data.quotes.filter((q) => q.style === (state.quoteStyle || 'hope'))
  const fit = mine.filter((q) => q.for.includes(moment))
  const pool = fit.length ? fit : mine
  const day = Math.floor(Date.now() / 86400000)
  return pool[hash(moment + day) % pool.length]
}
