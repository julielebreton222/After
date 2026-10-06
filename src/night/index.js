// Night stories, found from the files in /stories at build time:
//   <feeling>-<title>.m4a (or .mp3)   the recording, required
//   <feeling>-<title>.png (or .jpg)   an illustration, optional
//   <feeling>-<title>.md              the text, optional ("# Title" on line 1)
// Dropping new files in the folder and pushing is enough to add a story.
import { night } from '../data'

const audio = import.meta.glob('/stories/*.{m4a,mp3}', { eager: true, query: '?url', import: 'default' })
const images = import.meta.glob('/stories/*.{png,jpg}', { eager: true, query: '?url', import: 'default' })
const texts = import.meta.glob('/stories/*.md', { eager: true, query: '?raw', import: 'default' })

export { night }
const base = (path) => path.split('/').pop().replace(/\.[^.]+$/, '')
const find = (files, name) => Object.entries(files).find(([p]) => base(p) === name)?.[1]
// Longest slug first, so "missing-someone-x" isn't read as "missing".
const slugs = night.feelings.map((f) => f.slug).sort((a, b) => b.length - a.length)

function titleFrom(name, slug, text) {
  const heading = text?.match(/^#\s+(.+)$/m)?.[1]
  if (heading) return heading.trim()
  const rest = name.slice(slug.length + 1).replace(/-/g, ' ')
  return rest ? rest[0].toUpperCase() + rest.slice(1) : name
}

export const stories = Object.entries(audio)
  .map(([path, src]) => {
    const id = base(path)
    const feeling = slugs.find((s) => id.startsWith(s + '-'))
    if (!feeling) return null
    const text = find(texts, id)
    return {
      id,
      feeling,
      src,
      image: find(images, id),
      title: titleFrom(id, feeling, text),
      text: text?.replace(/^#\s+.+\n?/, '').trim(),
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title))

export const storiesFor = (slug) => stories.filter((s) => s.feeling === slug)
export const storyById = Object.fromEntries(stories.map((s) => [s.id, s]))
