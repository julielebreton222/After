import { useState } from 'react'
import data from '../toolkit/habits.json'
import { renameHero } from '../hero'

renameHero(data)

const U = data.ui

// The phone's own date (not UTC), so "today" changes at local midnight.
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }
// A weekly habit is logged under the Monday of its week.
const monday = (d) => { const m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m }

// Habits are off until he starts one. A started habit can be tracked or not;
// an untracked habit is just a reminder on his list. No streaks, no scores.
export default function Habits({ state, update }) {
  const mine = state.habits || {}
  const set = (id, patch) =>
    update((st) => ({ habits: { ...st.habits, [id]: { log: {}, ...st.habits?.[id], ...patch } } }))
  const toggleDay = (id, key) => {
    const log = { ...(mine[id]?.log || {}) }
    if (log[key]) delete log[key]
    else log[key] = true
    set(id, { log })
  }

  // His own habits sit alongside the built-in ones.
  const all = [...data.habits, ...(state.customHabits || []).map((h) => ({ ...h, custom: true }))]
  const active = all.filter((h) => mine[h.id]?.active)
  const rest = all.filter((h) => !mine[h.id]?.active)

  const add = (title, every) => {
    const id = `own-${Date.now()}`
    update((st) => ({
      customHabits: [...(st.customHabits || []), { id, title, every }],
      habits: { ...st.habits, [id]: { active: true, track: true, log: {} } },
    }))
  }
  const remove = (id) => {
    if (!confirm(U.deleteConfirm)) return
    update((st) => {
      const habits = { ...st.habits }
      delete habits[id]
      return { customHabits: st.customHabits.filter((h) => h.id !== id), habits }
    })
  }

  return (
    <div className="tab-page habits">
      <h1>{data.title}</h1>
      {data.intro && <p className="note">{data.intro}</p>}

      <h2>{U.active}</h2>
      {active.length === 0 && <p className="note">{U.none}</p>}
      {active.map((h) => {
        const m = mine[h.id]
        const weekly = h.every === 'week'
        // The last 7 days, or the last 4 weeks, oldest first.
        const slots = weekly
          ? [3, 2, 1, 0].map((n) => monday(daysAgo(n * 7)))
          : [6, 5, 4, 3, 2, 1, 0].map(daysAgo)
        const now = iso(slots[slots.length - 1])
        return (
          <div key={h.id} className="habit active">
            <h3>{h.title} <span className="note">· {U[h.every]}</span></h3>
            {h.how && <p className="note">{h.how}</p>}
            <label className="switch-row">
              <input type="checkbox" checked={!!m.track} onChange={() => set(h.id, { track: !m.track })} />
              {U.track}
            </label>
            {m.track && (
              <>
                <button className={`chip ${m.log?.[now] ? 'selected' : ''}`} onClick={() => toggleDay(h.id, now)}>
                  {m.log?.[now] ? '✓ ' : ''}{weekly ? U.doneThisWeek : U.doneToday}
                </button>
                <div className="habit-days">
                  {slots.map((d) => {
                    const key = iso(d)
                    return (
                      <button key={key} className={`day ${m.log?.[key] ? 'on' : ''}`} onClick={() => toggleDay(h.id, key)}
                        aria-pressed={!!m.log?.[key]} aria-label={d.toLocaleDateString()}>
                        {weekly ? d.getDate() : d.toLocaleDateString(undefined, { weekday: 'narrow' })}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            <button className="link" onClick={() => set(h.id, { active: false })}>{U.stop}</button>
          </div>
        )
      })}

      {rest.length > 0 && <h2>{U.more}</h2>}
      {rest.map((h) => (
        <div key={h.id} className="habit">
          <h3>{h.title} <span className="note">· {U[h.every]}</span></h3>
          {h.why && <p>{h.why}</p>}
          {h.from && <p className="note source">{U.from.replace('{name}', h.from)}</p>}
          <button className="chip" onClick={() => set(h.id, { active: true })}>{U.start}</button>
          {h.custom && <button className="link" onClick={() => remove(h.id)}>{U.delete}</button>}
        </div>
      ))}

      <AddHabit add={add} />
    </div>
  )
}

// "Add your own habit": a name and how often. It starts straight away, tracked.
function AddHabit({ add }) {
  const [title, setTitle] = useState('')
  const [every, setEvery] = useState('day')
  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    add(title.trim(), every)
    setTitle('')
  }
  return (
    <form className="habit add-habit" onSubmit={submit}>
      <h2>{U.addTitle}</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={U.addPlaceholder} maxLength={80} />
      <div className="row">
        <select value={every} onChange={(e) => setEvery(e.target.value)} aria-label={U.addEvery}>
          <option value="day">{U.day}</option>
          <option value="week">{U.week}</option>
        </select>
        <button className="chip" type="submit" disabled={!title.trim()}>{U.add}</button>
      </div>
    </form>
  )
}
