import { useEffect, useRef, useState } from 'react'
import { say } from '../../text'

// HOLD: press and hold until the ring fills (burn, break a seal, light...).
// Letting go early slowly empties the ring again.
export default function Hold({ cfg, state, markDone }) {
  const ms = (cfg.seconds || 3) * 1000
  const [progress, setProgress] = useState(0)
  const p = useRef(0)
  const holding = useRef(false)
  const finished = useRef(false)

  useEffect(() => {
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = now - last
      last = now
      if (!finished.current) {
        p.current = holding.current ? Math.min(1, p.current + dt / ms) : Math.max(0, p.current - dt / 400)
        if (p.current >= 1) {
          finished.current = true
          holding.current = false
          navigator.vibrate?.(60)
          markDone()
        }
        setProgress(p.current)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [ms, markDone])

  const isDone = progress >= 1
  return (
    <div className="hold">
      {cfg.label && <p className="prompt">{say(cfg.label, state)}</p>}
      <button
        className={`hold-btn ${isDone ? 'finished' : ''} ${holding.current ? 'holding' : ''}`}
        style={{ '--p': progress }}
        onPointerDown={(e) => { if (!isDone) { e.currentTarget.setPointerCapture?.(e.pointerId); holding.current = true } }}
        onPointerUp={() => (holding.current = false)}
        onPointerCancel={() => (holding.current = false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isDone ? '✓' : say(cfg.button || 'Hold', state)}
      </button>
      {isDone && cfg.doneText && <p className="narration">{say(cfg.doneText, state)}</p>}
      {cfg.note && <p className="note">{say(cfg.note, state)}</p>}
    </div>
  )
}
