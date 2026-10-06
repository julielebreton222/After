import { useState } from 'react'
import { say, T, todayISO } from '../../text'

// NOTEBOOK: adds an entry to the curiosity notebook ("people") or the
// Who is Théo? map ("theo"). Auto-filled from the script, editable.
export default function NotebookEntry({ cfg, screen, state, update }) {
  const book = cfg.book === 'theo' ? 'who_is_theo' : 'notebook'
  const existing = state[book].find((e) => e.source === screen.id)
  const [text, setText] = useState(existing?.text ?? say(cfg.text || '', state))
  const [saved, setSaved] = useState(!!existing)

  const save = () => {
    const entry = { source: screen.id, person: cfg.person || null, name: cfg.name || '', region: cfg.region || null, text, date: todayISO() }
    update((st) => ({
      [book]: [...st[book].filter((e) => e.source !== screen.id), entry],
      done: { ...st.done, [screen.id]: true },
    }))
    setSaved(true)
  }

  return (
    <div className="notebook-entry">
      <textarea className="hand" rows={3} value={text} onChange={(e) => { setText(e.target.value); setSaved(false) }} />
      <div className="row">
        <span />
        <button className="small" disabled={!text.trim() || saved} onClick={save}>{saved ? '✓' : T.ui.save}</button>
      </div>
    </div>
  )
}
