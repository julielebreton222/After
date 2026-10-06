import { useState } from 'react'
import { story, chapterData, isChapterUnlocked, questScreens, screens } from '../story'
import { T, formatDate } from '../text'
import Quest from './interactions/Quest.jsx'
import LightMap from './LightMap.jsx'
import contact from '../contact.json'
import { Feedback, Confession } from './Confide.jsx'

// The menu: back to the story, chapters to reread, the Light Map and the
// People notebook (once unlocked), quests, and start over.
export default function Menu({ state, update, reset, close, toStory, openCrisis }) {
  const [view, setView] = useState('home')
  const go = (id) => { update((st) => ({ position: id, history: [...st.history, st.position] })); toStory(); close() }

  return (
    <div className="sheet menu" role="dialog" aria-modal="true">
      <div className="menu-top">
        {view !== 'home' ? <button className="link" onClick={() => setView('home')}>‹</button> : <span />}
        <button className="link" onClick={close} aria-label="Close">✕</button>
      </div>

      {view === 'home' && (
        <nav className="menu-list">
          <button onClick={() => { toStory(); close() }}>{T.ui.resume}</button>
          <button onClick={() => setView('chapters')}>{T.ui.chapters}</button>
          {state.unlocked.lightMap && <button onClick={() => setView('map')}>{T.ui.lightMap}</button>}
          {state.unlocked.notebook && <button onClick={() => setView('people')}>{T.ui.notebook}</button>}
          <button onClick={() => setView('quests')}>{T.ui.quests}</button>
          <button onClick={() => setView('confession')}>{contact.confession.menu}</button>
          <button onClick={() => setView('feedback')}>{contact.feedback.menu}</button>
          <button onClick={() => { update({ introDone: false }); close() }}>{T.ui.intro}</button>
          <button className="danger" onClick={() => { if (confirm(T.ui.startOverConfirm)) { reset(); toStory(); close() } }}>{T.ui.startOver}</button>
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

      {view === 'feedback' && <Feedback openCrisis={openCrisis} />}
      {view === 'confession' && <Confession state={state} update={update} openCrisis={openCrisis} />}
      {view === 'map' && (<><h2>{T.ui.lightMap}</h2><LightMap state={state} /></>)}
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
