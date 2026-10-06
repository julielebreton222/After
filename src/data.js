// All the app's words, in the chosen language (falling back to English for
// any file not translated yet), with the hero's name and pronouns applied.
import { LANG, localize } from './locale'
import storyEn from './story/story.json'
import toolkitEn from './toolkit/toolkit.json'
import habitsEn from './toolkit/habits.json'
import quotesEn from './toolkit/quotes.json'
import nightEn from './night/night.json'
import contactEn from './contact.json'

const chaptersEn = import.meta.glob('./story/chapter-*.json', { eager: true, import: 'default' })
const fr = import.meta.glob('./locales/fr/*.json', { eager: true, import: 'default' })

// The Who Is Théo? map's regions are saved by their English name, whatever
// the language; regionLabel() gives the name to show.
export const mapRegionKeys = [...storyEn.mapRegions]

const pick = (en, name) => localize((LANG === 'fr' && fr[`./locales/fr/${name}`]) || en)

export const story = pick(storyEn, 'story.json')
export const toolkit = pick(toolkitEn, 'toolkit.json')
export const habits = pick(habitsEn, 'habits.json')
export const quotes = pick(quotesEn, 'quotes.json')
export const night = pick(nightEn, 'night.json')
export const contact = pick(contactEn, 'contact.json')
export const regionLabel = (key) => story.mapRegions[mapRegionKeys.indexOf(key)] || key
export const chapters = Object.entries(chaptersEn)
  .map(([path, en]) => pick(en, path.split('/').pop()))
  .sort((a, b) => a.number - b.number)
