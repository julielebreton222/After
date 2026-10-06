import { useRef, useState } from 'react'
import { say } from '../../text'

// DRAG: drag objects to targets.
// mode "sort": every item into one of the zones (e.g. give back / keep / let go).
// mode "target": one item to one target (e.g. the stone to the lake); a quick
// upward flick also counts.
export default function Drag({ cfg, screen, state, update, markDone }) {
  const sort = cfg.mode !== 'target'
  const items = sort ? cfg.items : [cfg.item]
  const zones = sort ? cfg.zones : [cfg.target]
  const saved = state.choices[screen.id]
  const [placed, setPlaced] = useState(saved && typeof saved === 'object' ? saved : {})
  const [line, setLine] = useState(null)
  const [selected, setSelected] = useState(null) // tap an item, then tap a zone
  const zonesRef = useRef(null)

  const place = (itemId, zoneId) => {
    const next = { ...placed, [itemId]: zoneId }
    setPlaced(next)
    setSelected(null)
    const finished = items.every((i) => next[i.id])
    update((st) => ({ choices: { ...st.choices, [screen.id]: next } }))
    if (finished) markDone()
  }

  const loose = items.filter((i) => !placed[i.id])

  return (
    <div className={`drag drag-${sort ? 'sort' : 'target'}`}>
      {cfg.prompt && <p className="prompt">{say(cfg.prompt, state)}</p>}
      <div className="drag-items">
        {loose.map((i) => (
          <Draggable key={i.id} item={i} state={state} selected={selected === i.id}
            onPick={() => {
              setLine(i.line ? say(i.line, state) : null)
              setSelected(i.id)
              zonesRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }}
            onDrop={(z) => place(i.id, z)} flickTo={sort ? null : zones[0].id} />
        ))}
      </div>
      {line && <p className="narration drag-line">{line}</p>}
      <div className="drag-zones" ref={zonesRef}>
        {zones.map((z) => (
          <div key={z.id} className={`zone ${selected ? 'ready' : ''}`} data-zone={z.id} onClick={() => selected && place(selected, z.id)}>
            <span className="zone-label">{say(z.label, state)}</span>
            <div className="zone-items">
              {items.filter((i) => placed[i.id] === z.id).map((i) => (
                <span key={i.id} className="chip placed" onClick={() => sort && setPlaced((p) => { const n = { ...p }; delete n[i.id]; return n })}>
                  {say(i.label, state)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Draggable({ item, state, selected, onPick, onDrop, flickTo }) {
  const [off, setOff] = useState(null)
  const start = useRef(null)

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    setOff({ x: 0, y: 0 })
    onPick()
  }
  const move = (e) => {
    if (!start.current) return
    setOff({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })
  }
  const up = (e) => {
    if (!start.current) return
    const s = start.current
    start.current = null
    setOff(null)
    const zone = document.elementsFromPoint(e.clientX, e.clientY).find((el) => el.dataset?.zone)
    if (zone) return onDrop(zone.dataset.zone)
    const dy = e.clientY - s.y
    const speed = Math.abs(dy) / Math.max(1, performance.now() - s.t)
    if (flickTo && dy < -60 && speed > 0.5) onDrop(flickTo)
  }

  return (
    <span
      className={`chip draggable ${off ? 'dragging' : ''} ${selected ? 'selected' : ''}`}
      style={off ? { transform: `translate(${off.x}px, ${off.y}px)` } : undefined}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { start.current = null; setOff(null) }}
    >
      {say(item.label, state)}
    </span>
  )
}
