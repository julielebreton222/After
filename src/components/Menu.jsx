import { useState } from 'react'
import { story, chapterData, isChapterUnlocked, questScreens, screens } from '../story'
import { T, formatDate } from '../text'
import Quest from './interactions/Quest.jsx'
import ArtFrame from './ArtFrame.jsx'

// The menu: back to the story, chapters to reread, the Light Map and the
// People notebook (once unlocked), quests, and start over.
export default function Menu({ state, update, reset, close }) {
  const [view, setView] = useState('home')
  const go = (id) => { update((st) => ({ position: id, history: [...st.history, st.position] })); close() }

  return (
    <div className="sheet menu" role="dialog" aria-modal="true">
      <div className="menu-top">
        {view !== 'home' ? <button className="link" onClick={() => setView('home')}>‹</button> : <span />}
        <button className="link" onClick={close} aria-label="Close">✕</button>
      </div>

      {view === 'home' && (
        <nav className="menu-list">
          <button onClick={close}>{T.ui.resume}</button>
          <button onClick={() => setView('chapters')}>{T.ui.chapters}</button>
          {state.unlocked.lightMap && <button onClick={() => setView('map')}>{T.ui.lightMap}</button>}
          {state.unlocked.notebook && <button onClick={() => setView('people')}>{T.ui.notebook}</button>}
          <button onClick={() => setView('quests')}>{T.ui.quests}</button>
          <button className="danger" onClick={() => { if (confirm(T.ui.startOverConfirm)) { reset(); close() } }}>{T.ui.startOver}</button>
          <p className="note version">Version {__BUILD__}</p>
        </nav>
      )}

      {view === 'chapters' && (
        <nav className="menu-list">
          <h2>{T.ui.chapters}</h2>
          {story.chapters.map((c) => {
            const data = chapterData(c.number)
            const open = data && isChapterUnlocked(c.number, state)
            return (
              <button key={c.number} disabled={!open} onClick={() => go(data.screens[0].id)}>
                <span>{c.number}. {c.title}</span>
                {!open && <span className="note">{data ? T.ui.locked : T.ui.comingSoon}</span>}
              </button>
            )
          })}
        </nav>
      )}

      {view === 'map' && <LightMap state={state} />}
      {view === 'people' && <People state={state} />}

      {view === 'quests' && (
        <div className="quest-list">
          <h2>{T.ui.quests}</h2>
          {questScreens()
            .filter((s) => state.done[s.id] || state.quests[s.interaction.id] || seen(s, state))
            .map((s) => (
              <Quest key={s.id} cfg={s.interaction} state={state} update={update}
                markDone={() => update((st) => ({ done: { ...st.done, [s.id]: true } }))} openCrisis={() => {}} />
            ))}
        </div>
      )}
    </div>
  )
}

// A quest shows in the list once the player has reached its screen.
function seen(s, state) {
  const idx = screens.findIndex((x) => x.id === s.id)
  const here = screens.findIndex((x) => x.id === state.position)
  return here >= idx
}

// The Light Map: the city at night, one lit window per light earned.
// Tap a window for that person's card.
function LightMap({ state }) {
  const [open, setOpen] = useState(null)
  const person = open && story.people[story.lights[open]?.person]
  const entries = person
    ? state.notebook.filter((e) => e.person === story.lights[open].person || (e.name && e.name.toLowerCase() === person.name.toLowerCase()))
    : []

  return (
    <div className="light-map">
      <h2>{T.ui.lightMap}</h2>
      <div className="skyline">
        <ArtFrame art={story.lightMapArt} camera={{ x: 50, y: 66, zoom: 1.25 }}>
          {state.lights.map((id) => {
            const l = story.lights[id]
            if (!l) return null
            return (
              <button key={id} className={`window ${open === id ? 'open' : ''}`} style={{ left: `${l.x}%`, top: `${l.y}%` }}
                onClick={() => setOpen(open === id ? null : id)} aria-label={l.label} />
            )
          })}
        </ArtFrame>
      </div>
      {person && (
        <div className="person-card">
          <h3>{person.name}</h3>
          <p className="note">{person.about}</p>
          {state.hours[story.lights[open].person] > 0 && (
            <p>{T.ui.hours.replace('{n}', state.hours[story.lights[open].person])}</p>
          )}
          {entries.map((e, i) => <p key={i} className="hand">{e.text}</p>)}
        </div>
      )}
    </div>
  )
}

// The curiosity notebook: "Each page is for someone else's life."
function People({ state }) {
  return (
    <div className="people">
      <h2>{T.ui.notebook}</h2>
      {state.notebook.length === 0 && <p className="note">{T.ui.emptyNotebook}</p>}
      {state.notebook.map((e, i) => (
        <div key={i} className="page">
          {e.name && <h3 className="hand">{e.name}</h3>}
          <p className="hand">{e.text}</p>
          <span className="note">{formatDate(e.date)}</span>
        </div>
      ))}
    </div>
  )
}
