import { useState } from 'react'
import { T } from '../text'
import { crisisLines, detectCountry } from '../safety'
import Timer from './interactions/Timer.jsx'

const t = T.notOkay
const tel = (n) => `tel:${n.replace(/\s/g, '')}`
// "sms:NUMBER?&body=" works on both iPhone and Android.
const sms = (n, body) => `sms:${n.replace(/\s/g, '')}?&body=${encodeURIComponent(body)}`

// The "I'm not okay" page: crisis line for the phone's country, a button to
// message the saved person, and "Breathe with me".
export default function NotOkay({ state, update, crisis, close }) {
  const code = state.country || detectCountry()
  const line = crisisLines.countries[code] || crisisLines.countries[crisisLines.default]
  const [breathing, setBreathing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(state.savedPerson?.name || '')
  const [phone, setPhone] = useState(state.savedPerson?.phone || '')
  const person = state.savedPerson

  const savePerson = () => {
    update({ savedPerson: phone.trim() ? { name: name.trim() || phone.trim(), phone: phone.trim() } : null })
    setEditing(false)
  }

  return (
    <div className="sheet not-okay" role="dialog" aria-modal="true">
      <h1>{t.title}</h1>
      {crisis && <p className="crisis-intro">{t.crisisIntro}</p>}
      <p>{t.intro}</p>

      <section className="help">
        <h2>1. {t.callLabel}</h2>
        <a className="big-link" href={tel(line.number)}>
          <strong>{line.number}</strong>
          <span>{line.name}</span>
          <span className="note">{line.hours}</span>
        </a>
        <p className="note">
          {t.emergencyLabel} <a href={tel(line.emergency)}>{line.emergency}</a>
        </p>
        <label className="country">
          {t.countryLabel}{' '}
          <select value={code} onChange={(e) => update({ country: e.target.value })}>
            {Object.entries(crisisLines.countries).map(([c, l]) => <option key={c} value={c}>{l.country}</option>)}
          </select>
        </label>
        <p className="note"><a href={crisisLines.elsewhere.url} target="_blank" rel="noreferrer">{crisisLines.elsewhere.text}</a></p>
      </section>

      <section className="help">
        <h2>2. {person && !editing ? t.messageLabel.replace('{name}', person.name) : t.noPerson}</h2>
        {person && !editing ? (
          <>
            <a className="big-link" href={sms(person.phone, t.messageBody)}><strong>✉ {person.name}</strong><span className="note">“{t.messageBody}”</span></a>
            <button className="link" onClick={() => setEditing(true)}>✎</button>
          </>
        ) : (
          <div className="person-form">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={T.firstLaunch.namePlaceholder} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={T.firstLaunch.phonePlaceholder} type="tel" inputMode="tel" />
            <button className="small" onClick={savePerson}>{t.savePerson}</button>
          </div>
        )}
      </section>

      <section className="help">
        <h2>3. {t.breatheLabel}</h2>
        {breathing ? (
          <Timer cfg={{ style: 'breath', seconds: 120, inhale: 4, exhale: 6, autoStart: true }} state={state} markDone={() => {}} />
        ) : (
          <button className="small" onClick={() => setBreathing(true)}>{T.ui.begin}</button>
        )}
      </section>

      <button className="continue" onClick={close}>{t.back}</button>
    </div>
  )
}
