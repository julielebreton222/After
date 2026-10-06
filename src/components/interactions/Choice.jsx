import { useState } from 'react'
import { say, T } from '../../text'

// CHOICE: 2 to 4 buttons, none wrong. Options may "set" saved values and "goto" a branch.
// With "pick" (a number or "any"), several can be chosen, then Continue.
// With "allowWrite", the player can add their own option.
export default function Choice({ cfg, screen, state, update, advance }) {
  const saved = state.choices[screen.id]
  const multi = cfg.pick != null && cfg.pick !== 1
  const max = cfg.pick === 'any' ? Infinity : cfg.pick
  const [sel, setSel] = useState(Array.isArray(saved) ? saved : [])
  const [own, setOwn] = useState('')

  const choose = (o) => {
    update((st) => {
      const patch = {
        ...(o.set || {}),
        choices: { ...st.choices, [screen.id]: o.id },
        done: { ...st.done, [screen.id]: true },
      }
      // Hours together, counted the first time only.
      if (o.hours && !st.done[screen.id]) {
        patch.hours = { ...st.hours }
        for (const [p, h] of Object.entries(o.hours)) patch.hours[p] = (patch.hours[p] || 0) + h
      }
      return patch
    })
    advance(o.goto)
  }

  const toggle = (id) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < max ? [...s, id] : s))

  const confirm = () => {
    const labels = sel.map((id) => cfg.options.find((o) => o.id === id)?.label || id)
    update((st) => ({
      choices: { ...st.choices, [screen.id]: sel },
      done: { ...st.done, [screen.id]: true },
      ...(cfg.saveAs ? { [cfg.saveAs]: labels } : {}),
    }))
    advance(cfg.continueTo)
  }

  const custom = sel.filter((id) => !cfg.options.some((o) => o.id === id))

  return (
    <>
      {cfg.prompt && <p className="prompt">{say(cfg.prompt, state)}</p>}
      <div className="choices">
        {cfg.options.map((o) => {
          const on = multi ? sel.includes(o.id) : saved === o.id
          return (
            <button key={o.id} className={`choice ${on ? 'chosen' : ''}`} onClick={() => (multi ? toggle(o.id) : choose(o))}>
              {say(o.label, state)}
            </button>
          )
        })}
        {custom.map((text) => (
          <button key={text} className="choice chosen hand" onClick={() => toggle(text)}>{text}</button>
        ))}
      </div>
      {multi && cfg.allowWrite && sel.length < max && (
        <div className="own-row">
          <input value={own} onChange={(e) => setOwn(e.target.value)} maxLength={80} placeholder={cfg.writePlaceholder || '…'} />
          <button className="small" disabled={!own.trim()} onClick={() => { toggle(own.trim()); setOwn('') }}>+</button>
        </div>
      )}
      {multi && (
        <button className="continue" disabled={sel.length < (cfg.min ?? 0)} onClick={confirm}>{T.ui.continue}</button>
      )}
    </>
  )
}
