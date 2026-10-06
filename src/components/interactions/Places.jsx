import { useEffect } from 'react'
import { story } from '../../story'
import { say } from '../../text'

// PLACES: suggests 2 or 3 kinds of places from story.json "places", based on
// two earlier choices (energy, and how much he wants to talk).
export default function Places({ cfg, screen, state, markDone }) {
  const base = screen.id.split(':')[0]
  const energy = state.choices[base] || 'some'
  const talk = state.choices[`${base}:2`] || 'little'
  const list = story.places[`${energy}-${talk}`] || story.places['some-little']
  useEffect(() => { markDone() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="places">
      {cfg.prompt && <p className="prompt">{say(cfg.prompt, state)}</p>}
      {list.map((p) => (
        <div key={p.name} className="place">
          <strong>{p.name}</strong>
          <span className="note">{p.why}</span>
        </div>
      ))}
    </div>
  )
}
