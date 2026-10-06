import { useState } from 'react'
import { say } from '../../text'

// TAP-OBJECTS: each object shows one line. Continue appears after one tap.
// With "advanceOnTap", tapping moves straight on (e.g. opening the door).
export default function TapObjects({ cfg, state, markDone, advance, onFocus }) {
  const [tapped, setTapped] = useState([])
  const [line, setLine] = useState(null)

  const tap = (o) => {
    setTapped((t) => (t.includes(o.id) ? t : [...t, o.id]))
    setLine(o.line ? say(o.line, state) : null)
    if (o.focus) onFocus?.(o.focus)
    markDone()
    if (cfg.advanceOnTap) advance(o.goto)
  }

  return (
    <>
      <div className="objects">
        {cfg.objects.map((o) => (
          <button key={o.id} className={`object ${tapped.includes(o.id) ? 'tapped' : ''}`} onClick={() => tap(o)}>
            {say(o.label, state)}
          </button>
        ))}
      </div>
      {line && <p className="object-line narration" key={line}>{line}</p>}
    </>
  )
}
