import { useState } from 'react'
import { say, T, formatDate, todayISO } from '../../text'
import { chapterData } from '../../story'
import { soundsUnsafe } from '../../safety'

// QUEST: a real-life task card. "I did it" (never checked by GPS or sensors),
// an optional "What did you notice?" box, or a notebook entry when the quest
// asks for one. Options:
//   "unlocks": 2           opens that chapter when done
//   "checkins": 3          needs three check-ins ("I went"), each can name a real person
//   "optional": true       never blocks the story
//   "weekly": true         can be done again every week (the lamp at the end)
export default function Quest({ cfg, state, update, markDone, openCrisis }) {
  const record = state.quests[cfg.id]
  const thisWeek = record && cfg.weekly && daysSince(record.date) < 7
  const done = cfg.weekly ? thisWeek : !!record
  const [stage, setStage] = useState('card') // card | report | later
  const [name, setName] = useState('')
  const [learned, setLearned] = useState('')
  const [notice, setNotice] = useState('')
  const checkins = record?.checkins || 0

  const finish = () => {
    const date = todayISO()
    update((st) => ({
      quests: { ...st.quests, [cfg.id]: { date, notice: notice.trim() || null, checkins: cfg.checkins || 1 } },
      notebook: cfg.notebook && (name.trim() || learned.trim())
        ? [...st.notebook, { source: cfg.id, name: name.trim(), text: learned.trim(), date }]
        : st.notebook,
    }))
    markDone()
    setStage('card')
    if (soundsUnsafe(`${learned} ${notice}`)) openCrisis()
  }

  // One check-in for multi-visit quests; a name adds hours to a "real people" card.
  const checkIn = () => {
    const who = name.trim()
    const n = checkins + 1
    update((st) => ({
      quests: { ...st.quests, [cfg.id]: { ...(st.quests[cfg.id] || {}), checkins: n, date: todayISO(), partial: n < cfg.checkins } },
      realPeople: who ? { ...st.realPeople, [who]: (st.realPeople[who] || 0) + (cfg.hoursPerVisit || 1) } : st.realPeople,
    }))
    setName('')
    if (n >= cfg.checkins) markDone()
  }

  const multi = cfg.checkins > 1
  const multiDone = multi && checkins >= cfg.checkins
  const isDone = multi ? multiDone : done

  return (
    <div className="quest-wrap">
      <div className={`quest-card ${isDone ? 'quest-done' : ''} ${cfg.optional ? 'quest-optional' : ''}`}>
        <span className="quest-kicker">{cfg.optional ? T.ui.optionalQuest : T.ui.quest}</span>
        <h3>{say(cfg.title, state)}</h3>
        <p>{say(cfg.text, state)}</p>

        {multi && (
          <>
            <div className="checkins">
              {Array.from({ length: cfg.checkins }, (_, i) => <span key={i} className={i < checkins ? 'on' : ''}>{i + 1}</span>)}
            </div>
            {!multiDone && (
              <div className="quest-report">
                <input className="hand" value={name} maxLength={40} placeholder={T.ui.realPersonPrompt} onChange={(e) => setName(e.target.value)} />
                <div className="row center"><button className="small" onClick={checkIn}>{T.ui.iWent}</button></div>
              </div>
            )}
          </>
        )}

        {!multi && isDone && (
          <>
            <p className="quest-stamp">✓ {formatDate(record.date)}</p>
            {cfg.unlocks && (
              <p className="note">
                {T.ui.chapterUnlocked.replace('{n}', cfg.unlocks)}
                {!chapterData(cfg.unlocks) && ` ${T.ui.comingSoon}.`}
              </p>
            )}
          </>
        )}

        {!multi && !isDone && stage === 'card' && (
          <div className="row center">
            <button className="link" onClick={() => setStage('later')}>{T.ui.notYet}</button>
            <button className="small" onClick={() => setStage('report')}>{T.ui.iDidIt}</button>
          </div>
        )}
        {!multi && !isDone && stage === 'later' && (
          <>
            <p className="note">{T.ui.questWaiting}</p>
            <div className="row center"><button className="small" onClick={() => setStage('report')}>{T.ui.iDidIt}</button></div>
          </>
        )}
        {!multi && !isDone && stage === 'report' && (
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

function daysSince(iso) {
  return (Date.now() - new Date(iso + 'T12:00:00').getTime()) / 864e5
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
