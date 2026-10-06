import { useState } from 'react'
import { T } from '../text'
import { DEFAULT_HERO } from '../locale'
import { crisisLines, detectCountry } from '../safety'
import { quoteStyles, quoteUi, sampleQuotes } from '../quotes'
import Quote from './Quote.jsx'

const t = T.intro
const f = T.firstLaunch

// The introduction, shown on first launch (and from the menu, "About this
// app"): why the app exists, the hero's name, a tour of the app, why this
// matters, which quotes speak to you, and the first-launch note.
export default function Intro({ state, update }) {
  const firstTime = !state.firstLaunchDone
  const steps = ['why', 'name', 'tour', 'facts', 'quotes', ...(firstTime ? ['start'] : [])]
  const [i, setI] = useState(0)
  const [hero, setHero] = useState(state.heroName || '')
  const [style, setStyle] = useState(state.quoteStyle || null)
  const [person, setPerson] = useState({ name: '', phone: '' })
  const step = steps[i]
  const code = state.country || detectCountry()
  const line = crisisLines.countries[code] || crisisLines.countries[crisisLines.default]
  const def = (s) => s.replace('{default}', DEFAULT_HERO)

  const finish = (withPerson) => {
    const patch = { introDone: true, firstLaunchDone: true, heroName: hero.trim(), quoteStyle: style || 'hope' }
    if (firstTime) {
      patch.savedPerson = withPerson && person.phone.trim()
        ? { name: person.name.trim() || person.phone.trim(), phone: person.phone.trim() }
        : null
    }
    update(patch)
  }
  const next = () => (i < steps.length - 1 ? setI(i + 1) : finish(false))

  return (
    <div className="sheet intro">
      <div className="intro-dots" aria-hidden="true">
        {steps.map((s, n) => <span key={s} className={n === i ? 'on' : ''} />)}
      </div>

      {step === 'why' && (
        <>
          <h1>{t.why.title}</h1>
          {t.why.body.map((p, n) => <p key={n}>{p}</p>)}
          <p className="hand sign">— {t.why.sign}</p>
        </>
      )}

      {step === 'name' && (
        <>
          <h1>{t.name.title}</h1>
          <p>{def(t.name.body)}</p>
          <div className="person-form">
            <input value={hero} onChange={(e) => setHero(e.target.value)} placeholder={def(t.name.placeholder)} maxLength={24} autoComplete="given-name" />
            <p className="note">{t.name.hint}</p>
          </div>
        </>
      )}

      {step === 'tour' && (
        <>
          <h1>{t.tour.title}</h1>
          <ul className="tour">
            {t.tour.items.map((it) => (
              <li key={it.title}>
                <span className="tour-icon" aria-hidden="true">{it.icon}</span>
                <span><strong>{it.title}</strong><br />{it.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {step === 'facts' && (
        <>
          <h1>{t.facts.title}</h1>
          <ul className="facts">
            {t.facts.items.map((it) => (
              <li key={it.text}>{it.text} <span className="note">({it.source})</span></li>
            ))}
          </ul>
          {t.facts.after.map((p, n) => <p key={n}>{p}</p>)}
          <a className="big-link" href={`tel:${line.number.replace(/\s/g, '')}`}>
            <strong>{line.number}</strong>
            <span>{line.name}</span>
            <span className="note">{line.hours}</span>
          </a>
        </>
      )}

      {step === 'quotes' && (
        <>
          <h1>{quoteUi.title}</h1>
          <p>{quoteUi.intro}</p>
          {quoteStyles.map((s, n) => (
            <button key={s.id} className={`quote-choice ${style === s.id ? 'selected' : ''}`} onClick={() => setStyle(s.id)} aria-pressed={style === s.id}>
              <Quote quote={sampleQuotes[n]} />
              <span className="note">{s.label}: {s.description}</span>
            </button>
          ))}
        </>
      )}

      {step === 'start' && (
        <>
          <h1>{f.title}</h1>
          {f.body.map((p, n) => <p key={n}>{p}</p>)}
          <div className="person-form">
            <h2>{f.personTitle}</h2>
            <p className="note">{f.personHint}</p>
            <input value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} placeholder={f.namePlaceholder} autoComplete="off" />
            <input value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} placeholder={f.phonePlaceholder} type="tel" inputMode="tel" />
          </div>
          <button className="continue" onClick={() => finish(true)}>{f.start}</button>
          <button className="link" onClick={() => finish(false)}>{f.skip}</button>
        </>
      )}

      {step !== 'start' && (
        <div className="row intro-nav">
          {i > 0 ? <button className="link" onClick={() => setI(i - 1)}>{t.back}</button> : <span />}
          <button className="continue" onClick={next} disabled={step === 'quotes' && !style}>
            {i === steps.length - 1 ? t.done : t.next}
          </button>
        </div>
      )}
    </div>
  )
}
