import { LANG } from '../../locale'
import { useEffect, useState } from 'react'
import { say, T } from '../../text'

// TIMER: a guided timer with a skip button.
// style: "breath" (circle, in/out), "candle", "shake", "wave", "grounding" (cycles through
// cfg.steps), or "plain". Used on story screens and on the "I'm not okay" page.
export default function Timer({ cfg, state, markDone }) {
  const total = cfg.seconds || 60
  const [phase, setPhase] = useState(cfg.autoStart ? 'running' : 'ready')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (phase !== 'running') return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'running' && elapsed >= total) {
      setPhase('finished')
      markDone()
    }
  }, [elapsed, phase, total, markDone])

  const left = Math.max(0, total - elapsed)
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  // Breathing: in for `inhale` seconds, out for `exhale` seconds.
  const inhale = cfg.inhale || 4
  const exhale = cfg.exhale || 6
  const t = elapsed % (inhale + exhale)
  const breathingIn = t < inhale
  const scale = phase !== 'running' ? 0.7
    : breathingIn ? 0.6 + 0.6 * ((t + 1) / inhale) : 1.2 - 0.6 * ((t - inhale + 1) / exhale)
  const steps = cfg.steps || []
  const step = steps.length ? steps[Math.floor(elapsed / Math.max(1, Math.floor(total / steps.length))) % steps.length] : null

  return (
    <div className={`timer timer-${cfg.style || 'plain'} ${phase}`}>
      {cfg.label && <p className="prompt">{say(cfg.label, state)}</p>}
      <div className="timer-visual" aria-hidden="true">
        {cfg.style === 'breath' && <div className="breath-circle" style={{ transform: `scale(${scale})` }} />}
        {cfg.style === 'candle' && <div className="candle"><div className="flame" /><div className="wax" /></div>}
        {cfg.style === 'shake' && <div className="shaker">🕺</div>}
        {cfg.style === 'wave' && <div className="wave" />}
      </div>
      {phase === 'running' && cfg.style === 'breath' && (
        <p className="timer-cue">{breathingIn ? cfg.inLabel || (LANG === 'fr' ? 'Inspire' : 'Breathe in') : cfg.outLabel || (LANG === 'fr' ? 'Expire' : 'Breathe out')}</p>
      )}
      {phase === 'running' && step && <p className="timer-cue">{say(step, state)}</p>}
      {phase !== 'ready' && <p className="clock">{phase === 'finished' ? say(cfg.doneText || '✓', state) : clock}</p>}
      <div className="row center">
        {phase === 'ready' && <button className="small" onClick={() => setPhase('running')}>{T.ui.begin}</button>}
        {phase !== 'finished' && (
          <button className="link" onClick={() => { setPhase('finished'); markDone() }}>{T.ui.skip}</button>
        )}
      </div>
    </div>
  )
}
