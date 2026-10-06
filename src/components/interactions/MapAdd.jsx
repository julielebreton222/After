import { useState } from 'react'
import { story } from '../../story'
import { say, T, todayISO } from '../../text'
import { MapItems } from '../Overlays.jsx'

// MAP: add things to the Who Is Théo? map. Pick a region, then tap a
// suggestion or write your own. Done after one item.
export default function MapAdd({ cfg, state, update, markDone }) {
  const [region, setRegion] = useState(cfg.region || story.mapRegions[0])
  const [text, setText] = useState('')
  const add = (t) => {
    const item = t.trim()
    if (!item) return
    update((st) => ({ who_is_theo: [...st.who_is_theo, { region, text: item, date: todayISO() }] }))
    setText('')
    markDone()
  }
  const chips = (cfg.chips || []).filter((c) => !state.who_is_theo.some((e) => e.text === c))
  return (
    <div className="map-add">
      {cfg.prompt && <p className="prompt">{say(cfg.prompt, state)}</p>}
      {!cfg.region && (
        <div className="choices row-wrap">
          {story.mapRegions.map((r) => (
            <button key={r} className={`chip-btn ${r === region ? 'chosen' : ''}`} onClick={() => setRegion(r)}>{r}</button>
          ))}
        </div>
      )}
      <div className="objects">
        {chips.map((c) => <button key={c} className="object" onClick={() => add(c)}>+ {c}</button>)}
      </div>
      <div className="own-row">
        <input className="hand" value={text} maxLength={60} placeholder={cfg.placeholder || T.ui.mapPlaceholder} onChange={(e) => setText(e.target.value)} />
        <button className="small" disabled={!text.trim()} onClick={() => add(text)}>+</button>
      </div>
      {state.who_is_theo.length > 0 && <MapItems state={state} />}
    </div>
  )
}
