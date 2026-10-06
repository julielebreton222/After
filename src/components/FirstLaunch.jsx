import { useState } from 'react'
import { T } from '../text'

// First launch: one screen saying this is a companion, not therapy,
// and (optionally) one person to message on a bad day.
export default function FirstLaunch({ update }) {
  const t = T.firstLaunch
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const start = (withPerson) =>
    update({
      firstLaunchDone: true,
      savedPerson: withPerson && phone.trim() ? { name: name.trim() || phone.trim(), phone: phone.trim() } : null,
    })

  return (
    <div className="sheet first-launch">
      <h1>{t.title}</h1>
      {t.body.map((p, i) => <p key={i}>{p}</p>)}
      <div className="person-form">
        <h2>{t.personTitle}</h2>
        <p className="note">{t.personHint}</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} autoComplete="off" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePlaceholder} type="tel" inputMode="tel" />
      </div>
      <button className="continue" onClick={() => start(true)}>{t.start}</button>
      <button className="link" onClick={() => start(false)}>{t.skip}</button>
    </div>
  )
}
