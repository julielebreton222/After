import { mapRegionKeys, regionLabel } from '../data'
import { story } from '../story'
import { formatDate, T } from '../text'

// Little things drawn on top of a painting, switched on per screen in the
// story files ("ladder", "showFriend", "showChart", ...).

// The courage ladder (Chapter 5): ten rungs, the lit ones glow.
export function Ladder({ lit = [], state }) {
  const top = Math.max(state.ladder_rung || 0, ...lit)
  return (
    <ol className="ladder" aria-label="The courage ladder">
      {[...story.ladder].reverse().map((label, i) => {
        const rung = story.ladder.length - i
        return (
          <li key={rung} className={rung <= top ? 'on' : ''}>
            <span className="rung-n">{rung}</span>
            <span className="rung-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function friendLevel(hours = 0) {
  const lv = story.friendLevels
  let current = lv[0]
  for (const l of lv) if (hours >= l.hours) current = l
  return current
}

// A friendship card: hours together, and the meter from stranger to friend.
export function FriendCard({ person, state }) {
  const p = story.people[person]
  if (!p) return null
  const h = state.hours[person] || 0
  const level = friendLevel(h)
  return (
    <div className="friend-card">
      <strong>{p.name}</strong>
      <span className="note">{T.ui.hours.replace('{n}', h)}</span>
      <ol className="meter">
        {story.friendLevels.map((l) => (
          <li key={l.name} className={l.hours <= h ? 'on' : ''} title={l.name}>{l.name === level.name ? l.name : ''}</li>
        ))}
      </ol>
    </div>
  )
}

// Prediction vs reality, drawn like a pencil sketch.
export function Chart({ which, state }) {
  const keys = which === 'all' ? [...new Set(state.predictions.map((p) => p.key))] : [which]
  const rows = keys
    .map((k) => {
      const ps = state.predictions.filter((p) => p.key === k)
      const before = [...ps].reverse().find((p) => p.kind === 'before')
      const after = [...ps].reverse().find((p) => p.kind === 'after')
      return before && after ? { k, before: before.value, after: after.value } : null
    })
    .filter(Boolean)
  if (!rows.length) return <div className="chart"><p className="hand">{T.ui.noPredictions}</p></div>
  return (
    <div className="chart">
      <div className="chart-legend"><span className="b">{T.ui.guessed}</span><span className="a">{T.ui.really}</span></div>
      {rows.map((r) => (
        <div key={r.k} className="chart-row">
          <span className="chart-label">{story.predictionLabels?.[r.k] || r.k}</span>
          <span className="bar b" style={{ width: `${r.before * 10}%` }}>{r.before}</span>
          <span className="bar a" style={{ width: `${r.after * 10}%` }}>{r.after}</span>
        </div>
      ))}
    </div>
  )
}

// The Who Is Théo? map: the player's own items, by region.
export function MapItems({ state }) {
  return (
    <div className="map-items">
      {mapRegionKeys.map((r) => {
        const items = state.who_is_theo.filter((e) => e.region === r)
        return (
          <div key={r} className="map-region">
            <span className="region-name">{regionLabel(r)}</span>
            {items.map((e, i) => <span key={i} className="hand map-item">{e.text}</span>)}
          </div>
        )
      })}
    </div>
  )
}

// A notebook page in the player's own handwriting.
export function NotebookPage({ source, state }) {
  const e = state.notebook.find((x) => x.source === source)
  if (!e) return null
  return (
    <div className="notebook-page">
      {e.name && <span className="hand np-name">{e.name}</span>}
      <span className="hand">{e.text}</span>
      <span className="note">{formatDate(e.date)}</span>
    </div>
  )
}

// What the player kept on the shelf (7.7).
export function Kept({ screenId, state, items }) {
  const placed = state.choices[screenId] || {}
  const kept = items.filter((i) => placed[i.id] === 'keep')
  if (!kept.length) return null
  return (
    <div className="kept">
      {kept.map((i) => <span key={i.id} className="hand">{i.label}</span>)}
    </div>
  )
}

// Everyone who has brought light into the story, as warm name tags (8.14).
export function People({ state }) {
  const seen = new Set()
  const names = []
  for (const id of state.lights) {
    const person = story.lights[id]?.person
    if (person && person !== 'theo' && !seen.has(person)) {
      seen.add(person)
      names.push(story.people[person]?.name)
    }
  }
  return <div className="people-tags">{names.map((n) => <span key={n}>{n}</span>)}</div>
}
