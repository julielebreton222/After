import { useState } from 'react'
import { say, T, todayISO } from '../../text'

// RATE: a 1 to 10 slider for awkwardness predictions. Saved to `predictions`.
// "kind" is "before" or "after"; with "compare", shows the matching before/after pair.
export default function Rate({ cfg, screen, state, update, markDone }) {
  const key = cfg.key || screen.id
  const kind = cfg.kind || 'before'
  const existing = [...state.predictions].reverse().find((p) => p.key === key && p.kind === kind && p.screen === screen.id)
  const [value, setValue] = useState(existing?.value ?? 5)
  const [saved, setSaved] = useState(!!existing)

  const save = () => {
    update((st) => ({
      predictions: [...st.predictions, { key, kind, value, screen: screen.id, date: todayISO() }],
      done: { ...st.done, [screen.id]: true },
    }))
    setSaved(true)
    markDone()
  }

  const before = cfg.compare ? [...state.predictions].reverse().find((p) => p.key === key && p.kind === 'before') : null

  return (
    <div className="rate">
      <p className="prompt">{say(cfg.prompt, state)}</p>
      <div className="rate-row">
        <span>1</span>
        <input type="range" min="1" max="10" value={value} disabled={saved} onChange={(e) => setValue(+e.target.value)} />
        <span>10</span>
      </div>
      <p className="rate-value">{value}</p>
      {!saved && <button className="small" onClick={save}>{T.ui.save}</button>}
      {saved && before && (
        <p className="narration">{before.value} → {value}</p>
      )}
    </div>
  )
}
