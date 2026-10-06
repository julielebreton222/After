import { useState } from 'react'
import { toolkit } from '../data'
import { byId, screens } from '../story'
import { quoteFor } from '../quotes'
import Quote from './Quote.jsx'

const order = Object.fromEntries(screens.map((s, i) => [s.id, i]))

// "What to do when…": practical cards, all open from day one. A card whose
// "story" screen the player has already reached says so ("Théo did this…").
export default function Toolkit({ state }) {
  const [open, setOpen] = useState(null)
  const here = order[state.position] ?? 0
  const reached = (id) => id && byId[id] && (state.done[id] || here >= order[id])

  return (
    <div className="tab-page toolkit">
      <h1>{toolkit.title}</h1>
      {toolkit.intro && <p className="note">{toolkit.intro}</p>}
      <Quote quote={quoteFor(state)} />
      {toolkit.cards.map((c, i) => (
        <div key={c.id} className="tool-group">
          {c.group && c.group !== toolkit.cards[i - 1]?.group && <h2>{c.group}</h2>}
          <div className={`tool-card ${open === c.id ? 'open' : ''}`}>
            <button className="tool-title" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
              <span>{c.title}</span>
              <span aria-hidden="true">{open === c.id ? '–' : '+'}</span>
            </button>
            {open === c.id && (
              <div className="tool-body">
                <ol>
                  {c.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                {c.from && <p className="note source">{toolkit.ui.from.replace('{name}', c.from)}</p>}
                {reached(c.story) && (
                  <p className="note theo-did">{toolkit.ui.theoDid.replace('{n}', byId[c.story].chapter)}</p>
                )}
                <Quote quote={quoteFor(state, c.id)} />
                {c.videos?.length > 0 && (
                  <div className="videos">
                    <h3>{toolkit.ui.watch}</h3>
                    {/* Just the link. Titles and channels stay in toolkit.json, for editing. */}
                    {c.videos.map((v) => (
                      <a key={v.id} className="video" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer">
                        youtube.com/watch?v={v.id}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
