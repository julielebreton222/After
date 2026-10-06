import { useState } from 'react'
import contact from '../contact.json'
import { soundsUnsafe } from '../safety'
import { formatDate, todayISO } from '../text'

const mailto = (subject, body) =>
  `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

// "Send Julie a note": feedback by email (no server: it opens the email app).
export function Feedback({ openCrisis }) {
  const t = contact.feedback
  const [text, setText] = useState('')
  const [warn, setWarn] = useState(false)
  const send = () => {
    if (soundsUnsafe(text)) openCrisis()
    if (!contact.email) return setWarn(true)
    location.href = mailto(t.subject, t.bodyStart + text)
  }
  return (
    <div className="confide">
      <h2>{t.title}</h2>
      <p>{t.intro}</p>
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.placeholder} />
      <button className="continue" onClick={send} disabled={!text.trim()}>{t.send}</button>
      <p className="note">{warn ? t.notSetUp : t.how}</p>
    </div>
  )
}

// Confession: write it, then let it go (erased), keep it on the phone, or
// send it to Julie by email.
export function Confession({ state, update, openCrisis }) {
  const t = contact.confession
  const [text, setText] = useState('')
  const [gone, setGone] = useState(false)
  const [burning, setBurning] = useState(false)
  const [warn, setWarn] = useState(false)
  const kept = state.confessions || []

  const check = () => { if (soundsUnsafe(text)) openCrisis() }
  const letGo = () => {
    check()
    setBurning(true)
    setTimeout(() => { setText(''); setBurning(false); setGone(true) }, 1600)
  }
  const keep = () => {
    check()
    update((st) => ({ confessions: [...(st.confessions || []), { text: text.trim(), date: todayISO() }] }))
    setText('')
  }
  const send = () => {
    check()
    if (!contact.email) return setWarn(true)
    location.href = mailto(t.subject, t.bodyStart + text)
  }
  const remove = (i) => {
    if (confirm(t.deleteConfirm)) update((st) => ({ confessions: st.confessions.filter((_, n) => n !== i) }))
  }

  return (
    <div className="confide">
      <h2>{t.title}</h2>
      <p>{t.intro}</p>
      <textarea
        rows={7}
        className={burning ? 'burning' : ''}
        value={text}
        onChange={(e) => { setText(e.target.value); setGone(false) }}
        placeholder={t.placeholder}
      />
      {gone && <p className="hand">{t.letGoDone}</p>}
      <div className="confide-actions">
        <button className="continue" onClick={letGo} disabled={!text.trim() || burning}>🔥 {t.letGo}</button>
        <button className="continue subtle" onClick={keep} disabled={!text.trim() || burning}>{t.keep}</button>
        <button className="continue subtle" onClick={send} disabled={!text.trim() || burning}>{t.send}</button>
      </div>
      <p className="note">{warn ? contact.feedback.notSetUp : t.how}</p>
      {kept.length > 0 && (
        <>
          <h2>{t.kept}</h2>
          {kept.map((c, i) => (
            <div key={i} className="page">
              <p className="hand">{c.text}</p>
              <span className="note">{formatDate(c.date)}</span>{' '}
              <button className="link" onClick={() => remove(i)}>{t.delete}</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
