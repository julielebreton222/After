import { useState } from 'react'
import { story } from '../story'
import { T } from '../text'
import ArtFrame from './ArtFrame.jsx'

// The Light Map: the city at night from Théo's window, one lit window per
// person known. A window glows brighter for each light that person brought.
// Tap a window for that person's card. Real people the player logged in the
// quests are listed underneath.
export default function LightMap({ state, compact = false }) {
  const [open, setOpen] = useState(null)

  const byPerson = {}
  for (const id of state.lights) {
    const l = story.lights[id]
    if (!l) continue
    byPerson[l.person] = (byPerson[l.person] || 0) + 1
  }
  const art = (state.maxChapter || 1) >= 9 ? story.lightMapArtFinal : story.lightMapArt
  const person = open && story.people[open]
  const entries = person
    ? state.notebook.filter((e) => e.person === open || (e.name && e.name.toLowerCase().includes(person.name.toLowerCase())))
    : []
  const real = Object.entries(state.realPeople || {})

  return (
    <div className={`light-map ${compact ? 'compact' : ''}`}>
      <div className="skyline">
        <ArtFrame art={art} anchor={{ x: 50, y: 62 }}>
          {Object.entries(byPerson).map(([p, n]) => {
            const pos = story.people[p]?.window
            if (!pos) return null
            return (
              <button
                key={p}
                className={`window glow-${Math.min(n, 3)} ${open === p ? 'open' : ''} ${p === 'theo' ? 'theo' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={(e) => { e.stopPropagation(); setOpen(open === p ? null : p) }}
                aria-label={story.people[p].name}
              />
            )
          })}
        </ArtFrame>
      </div>
      {person && (
        <div className="person-card" onClick={(e) => e.stopPropagation()}>
          <h3>{person.name}</h3>
          <p className="note">{person.about}</p>
          {state.hours[open] > 0 && <p>{T.ui.hours.replace('{n}', state.hours[open])}</p>}
          {entries.map((e, i) => <p key={i} className="hand">{e.text}</p>)}
        </div>
      )}
      {!compact && real.length > 0 && (
        <div className="real-people">
          <h3>{T.ui.realPeople}</h3>
          {real.map(([name, h]) => <p key={name}><span className="hand">{name}</span> <span className="note">{T.ui.hours.replace('{n}', h)}</span></p>)}
        </div>
      )}
    </div>
  )
}
