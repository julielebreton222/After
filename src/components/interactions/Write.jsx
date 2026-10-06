import { useState } from 'react'
import { say, T, todayISO } from '../../text'
import { soundsUnsafe } from '../../safety'

// WRITE: a text box with a prompt and a character limit. Saved on the phone. Skippable.
export default function Write({ cfg, screen, state, update, markDone, advance, openCrisis }) {
  const key = cfg.key || screen.id
  const max = cfg.max || 500
  const [text, setText] = useState(state.writes[key]?.text ?? say(cfg.prefill || '', state))
  const [saved, setSaved] = useState(!!state.writes[key])

  const save = () => {
    update((st) => ({
      writes: { ...st.writes, [key]: { text, date: todayISO() } },
      done: { ...st.done, [screen.id]: true },
      ...(cfg.addToMap
        ? { who_is_theo: [...st.who_is_theo.filter((e) => e.source !== key), { region: cfg.addToMap, text, source: key, date: todayISO() }] }
        : {}),
    }))
    setSaved(true)
    if (soundsUnsafe(text)) openCrisis()
  }

  return (
    <>
      {cfg.prompt && <p className="prompt">{say(cfg.prompt, state)}</p>}
      <textarea
        className="hand"
        value={text}
        maxLength={max}
        rows={cfg.rows || 4}
        placeholder={say(cfg.placeholder || '', state)}
        onChange={(e) => { setText(e.target.value); setSaved(false) }}
      />
      <div className="row">
        <span className="count">{text.length}/{max}</span>
        {!saved && <button className="link" onClick={() => { markDone(); advance(cfg.continueTo) }}>{T.ui.skip}</button>}
        <button className="small" disabled={!text.trim() || saved} onClick={save}>{saved ? '✓' : T.ui.save}</button>
      </div>
    </>
  )
}
