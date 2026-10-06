import { useState } from 'react'
import { say, T, formatDate, todayISO } from '../../text'
import { soundsUnsafe } from '../../safety'

// SEAL: the future letter. Write, pick an open date (at least minWeeks away),
// watch it seal. It stays sealed: the text is never shown again until it opens.
export default function Seal({ cfg, state, update, markDone, openCrisis }) {
  const minDate = new Date(Date.now() + (cfg.minWeeks || 8) * 7 * 864e5).toISOString().slice(0, 10)
  const [text, setText] = useState('')
  const [date, setDate] = useState(minDate)
  const letter = state.future_letter

  if (letter) {
    return (
      <div className="seal-done">
        <div className="wax" aria-hidden="true" />
        <p className="narration">{T.ui.sealDone.replace('{date}', formatDate(letter.open_date))}</p>
      </div>
    )
  }

  const seal = () => {
    const open_date = date < minDate ? minDate : date
    update({ future_letter: { text, open_date, sealed_at: todayISO() } })
    markDone()
    if (soundsUnsafe(text)) openCrisis()
  }

  return (
    <div className="seal">
      <textarea className="hand letter" rows={6} maxLength={3000} value={text}
        placeholder={say(cfg.placeholder || '', state)} onChange={(e) => setText(e.target.value)} />
      <label className="seal-date">
        {T.ui.sealTitle}
        <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <button className="small" disabled={!text.trim()} onClick={seal}>{T.ui.sealButton}</button>
    </div>
  )
}
