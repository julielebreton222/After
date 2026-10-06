import { useCallback, useEffect, useRef, useState } from 'react'
import { byId, screens, nextId, chapterData, isChapterUnlocked } from '../story'
import { T } from '../text'
import Panel from './Panel.jsx'
import Line from './Line.jsx'
import Interaction from './interactions/Interaction.jsx'
import { buildBeats } from '../beats'
import { speak, stopSpeaking } from '../audio/voice'
import { duck } from '../audio/music'

const UNLOCK_TOAST = { notebook: T.ui.notebookUnlocked, lightMap: T.ui.lightMapUnlocked }
const FORM_TAGS = 'button, a, input, textarea, select, label, .interaction'

export default function Player({ state, update, openCrisis }) {
  const screen = byId[state.position] || screens[0]
  const cfg = screen.interaction
  const done = !!state.done[screen.id]
  const [toast, setToast] = useState(null)
  const touch = useRef(null)

  // The screen's words, split into beats: one line per tap, typed out.
  // Arriving by swiping back shows the last line straight away.
  const beats = buildBeats(screen.words, state)
  const last = beats.length - 1
  const enterAtEnd = useRef(false)
  const [view, setView] = useState({ id: screen.id, beat: 0, full: false })
  const cur = view.id === screen.id
    ? view
    : { id: screen.id, beat: enterAtEnd.current ? Math.max(0, last) : 0, full: enterAtEnd.current }
  const wordsDone = beats.length === 0 || (cur.beat >= last && cur.full)

  useEffect(() => {
    setView(cur)
    enterAtEnd.current = false
  }, [screen.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Read the current line aloud, if that's switched on.
  const beatNow = beats[cur.beat]
  useEffect(() => {
    if (!state.settings.voice || !beatNow) return stopSpeaking()
    speak(beatNow.text, beatNow.speaker, { onStart: () => duck(true), onEnd: () => duck(false) })
  }, [screen.id, cur.beat, state.settings.voice]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const back = () => {
    if (cur.beat > 0) return setView({ ...cur, beat: cur.beat - 1, full: true })
    if (!state.history.length) return
    enterAtEnd.current = true
    update((st) =>
      st.history.length ? { position: st.history[st.history.length - 1], history: st.history.slice(0, -1) } : {}
    )
  }

  // A tap: finish typing the line, or show the next line, or go to the next screen.
  const forward = () => {
    if (beats.length && !cur.full) return setView({ ...cur, full: true })
    if (cur.beat < last) return setView({ ...cur, beat: cur.beat + 1, full: false })
    if (canGoOn) advance(target)
  }

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
    forward()
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
    else forward()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowLeft') back()
      if (e.key === 'ArrowRight' || e.key === ' ') forward()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const line = beatNow && (
    <Line
      key={`${screen.id}-${cur.beat}`}
      beat={beatNow}
      full={cur.full}
      onDone={() => setView((v) => (v.id === screen.id && v.beat === cur.beat && !v.full ? { ...v, full: true } : v))}
    />
  )

  return (
    <div className={`player ch-${screen.chapter}`} onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="stage" key={screen.id}>
        <Panel screen={screen} state={state}>
          {screen.layout === 'title' && line}
        </Panel>
        <div className="below">
          {screen.layout !== 'title' && line}
          {cfg && wordsDone && (
            <div className="interaction">
              <Interaction
                cfg={cfg} screen={screen} state={state} update={update}
                done={done} markDone={markDone} advance={advance} openCrisis={openCrisis}
              />
            </div>
          )}
          {cfg && wordsDone && canGoOn && cfg.type !== 'choice' && (
            <button className="continue" onClick={() => advance(target)}>{T.ui.continue}</button>
          )}
          {cfg?.type === 'choice' && wordsDone && done && canGoOn && (
            <button className="continue subtle" onClick={() => advance(target)}>{T.ui.continue}</button>
          )}
        </div>
        {(!wordsDone || (!cfg && canGoOn)) && <span className="tap-hint" aria-hidden="true">›</span>}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
