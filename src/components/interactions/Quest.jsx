import { useState } from 'react'
import { say, T, formatDate, todayISO } from '../../text'
import { chapterData } from '../../story'
import { soundsUnsafe } from '../../safety'

// QUEST: a real-life task card. "I did it" (never checked by GPS or sensors),
// an optional "What did you notice?" box, or a notebook entry when the quest asks
// for one. Done quests unlock the next chapter.
export default function Quest({ cfg, state, update, markDone, openCrisis }) {
  const done = state.quests[cfg.id]
  const [stage, setStage] = useState('card') // card | report | later
  const [name, setName] = useState('')
  const [learned, setLearned] = useState('')
  const [notice, setNotice] = useState('')

  const finish = () => {
    const date = todayISO()
    update((st) => ({
      quests: { ...st.quests, [cfg.id]: { date, notice: notice.trim() || null } },
      notebook: cfg.notebook && (name.trim() || learned.trim())
        ? [...st.notebook, { source: cfg.id, name: name.trim(), text: learned.trim(), date }]
        : st.notebook,
    }))
    markDone()
    if (soundsUnsafe(`${learned} ${notice}`)) openCrisis()
  }

  const next = cfg.unlocks
  const nextTitle = next ? `${next}` : null

  return (
    <div className="quest-wrap">
      <div className={`quest-card ${done ? 'quest-done' : ''}`}>
        <span className="quest-kicker">Quest</span>
        <h3>{say(cfg.title, state)}</h3>
        <p>{say(cfg.text, state)}</p>

        {done && (
          <>
            <p className="quest-stamp">✓ {formatDate(done.date)}</p>
            {next && (
              <p className="note">
                {T.ui.chapterUnlocked.replace('{n}', nextTitle)}
                {!chapterData(next) && ` ${T.ui.comingSoon}.`}
              </p>
            )}
          </>
        )}

        {!done && stage === 'card' && (
          <div className="row center">
            <button className="link" onClick={() => setStage('later')}>{T.ui.notYet}</button>
            <button className="small" onClick={() => setStage('report')}>{T.ui.iDidIt}</button>
          </div>
        )}
        {!done && stage === 'later' && (
          <>
            <p className="note">{T.ui.questWaiting}</p>
            <div className="row center"><button className="small" onClick={() => setStage('report')}>{T.ui.iDidIt}</button></div>
          </>
        )}
        {!done && stage === 'report' && (
          <div className="quest-report">
            {cfg.notebook ? (
              <>
                <input className="hand" value={name} maxLength={60} placeholder={say(cfg.notebook.namePrompt, state)} onChange={(e) => setName(e.target.value)} />
                <textarea className="hand" rows={3} maxLength={500} value={learned} placeholder={say(cfg.notebook.textPrompt, state)} onChange={(e) => setLearned(e.target.value)} />
              </>
            ) : (
              <textarea className="hand" rows={3} maxLength={500} value={notice} placeholder={T.ui.notice} onChange={(e) => setNotice(e.target.value)} />
            )}
            <div className="row center"><button className="small" onClick={finish}>{T.ui.save}</button></div>
          </div>
        )}
      </div>

      {cfg.tonight && <Tonight cfg={cfg.tonight} state={state} update={update} />}
    </div>
  )
}

// The small "Tonight" card: ticks reset every day.
function Tonight({ cfg, state, update }) {
  const day = todayISO()
  const ticks = state.tonight[day] || []
  const toggle = (item) =>
    update((st) => {
      const cur = st.tonight[day] || []
      return { tonight: { [day]: cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item] } }
    })
  return (
    <div className="tonight-card">
      <span className="quest-kicker">{say(cfg.title, state)}</span>
      {cfg.items.map((item) => (
        <label key={item} className="tick">
          <input type="checkbox" checked={ticks.includes(item)} onChange={() => toggle(item)} />
          <span>{say(item, state)}</span>
        </label>
      ))}
    </div>
  )
}
