import { useCallback, useEffect, useRef, useState } from 'react'
import { byId, screens, nextId, chapterData, isChapterUnlocked } from '../story'
import { T } from '../text'
import Panel from './Panel.jsx'
import Words from './Words.jsx'
import Interaction from './interactions/Interaction.jsx'

const UNLOCK_TOAST = { notebook: T.ui.notebookUnlocked, lightMap: T.ui.lightMapUnlocked }
const FORM_TAGS = 'button, a, input, textarea, select, label, .interaction'

export default function Player({ state, update, openCrisis }) {
  const screen = byId[state.position] || screens[0]
  const cfg = screen.interaction
  const done = !!state.done[screen.id]
  const [toast, setToast] = useState(null)
  const touch = useRef(null)

  // Things that happen on arriving at a screen: lights, haptics, unlocks.
  useEffect(() => {
    setToast(null)
    if (screen.light) {
      navigator.vibrate?.(80)
      update((st) => (st.lights.includes(screen.light) ? {} : { lights: [...st.lights, screen.light] }))
    }
    if (screen.unlock && !state.unlocked[screen.unlock]) {
      update((st) => ({ unlocked: { ...st.unlocked, [screen.unlock]: true } }))
      setToast(UNLOCK_TOAST[screen.unlock])
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [screen.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = (goto) => {
    const to = goto || nextId(screen.id)
    if (!to || !byId[to]) return
    update((st) => ({ position: to, history: [...st.history, screen.id].slice(-300) }))
  }

  const back = () =>
    update((st) =>
      st.history.length ? { position: st.history[st.history.length - 1], history: st.history.slice(0, -1) } : {}
    )

  const markDone = useCallback(
    () => update((st) => (st.done[screen.id] ? {} : { done: { ...st.done, [screen.id]: true } })),
    [update, screen.id]
  )

  // Where "Continue" (or a tap) goes from this screen.
  let target = nextId(screen.id)
  if (cfg?.continueTo) target = cfg.continueTo
  if (cfg?.type === 'choice' && !cfg.pick) {
    const chosen = cfg.options.find((o) => o.id === state.choices[screen.id])
    if (chosen?.goto) target = chosen.goto
  }
  if (cfg?.type === 'quest') {
    target = cfg.unlocks && chapterData(cfg.unlocks) && isChapterUnlocked(cfg.unlocks, state)
      ? chapterData(cfg.unlocks).screens[0].id
      : null
  }
  const canGoOn = !!target && byId[target] && (!cfg || done)

  const onClick = (e) => {
    if (e.target.closest(FORM_TAGS)) return
    if (canGoOn) advance(target)
  }

  const onTouchStart = (e) => {
    if (e.target.closest('.interaction')) return (touch.current = null)
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return
    if (dx > 0) back()
    else if (canGoOn) advance(target)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowLeft') back()
      if ((e.key === 'ArrowRight' || e.key === ' ') && canGoOn) advance(target)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className={`player ch-${screen.chapter}`} onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="stage" key={screen.id}>
        <Panel screen={screen} state={state} />
        <div className="below">
          {screen.layout !== 'title' && <Words words={screen.words} state={state} />}
          {cfg && (
            <div className="interaction">
              <Interaction
                cfg={cfg} screen={screen} state={state} update={update}
                done={done} markDone={markDone} advance={advance} openCrisis={openCrisis}
              />
            </div>
          )}
          {cfg && canGoOn && cfg.type !== 'choice' && (
            <button className="continue" onClick={() => advance(target)}>{T.ui.continue}</button>
          )}
          {cfg?.type === 'choice' && done && canGoOn && (
            <button className="continue subtle" onClick={() => advance(target)}>{T.ui.continue}</button>
          )}
        </div>
        {!cfg && canGoOn && <span className="tap-hint" aria-hidden="true">›</span>}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
