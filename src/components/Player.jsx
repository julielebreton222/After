import { useCallback, useEffect, useRef, useState } from 'react'
import { byId, screens, nextId, chapterData, isChapterUnlocked, itemsOf } from '../story'
import { T, resolve, letterReady, formatDate, keyFor } from '../text'
import Panel from './Panel.jsx'
import { artSrc } from './ArtFrame.jsx'
import Line from './Line.jsx'
import Interaction from './interactions/Interaction.jsx'
import { buildBeats } from '../beats'
import { speakLine, stopSpeaking } from '../audio/voice'
import { duck, setChapter, hush } from '../audio/music'

const UNLOCK_TOAST = { notebook: T.ui.notebookUnlocked, lightMap: T.ui.lightMapUnlocked, friends: T.ui.friendsUnlocked }
const FORM_TAGS = 'button, a, input, textarea, select, label, .interaction, .person-card'

export default function Player({ state, update, openCrisis }) {
  const screen = byId[state.position] || screens[0]
  // A screen can have one interaction or a list of them, shown one after another.
  // An item with "when": { "by": "choice:4.13", "in": ["how", "drawing"] } only
  // appears if that earlier choice was one of those.
  const items = itemsOf(screen).filter((it) => !it.cfg.when || (it.cfg.when.in || []).includes(keyFor(it.cfg.when.by, state)))
  const isDone = (it) => !!state.done[it.id] || !!it.cfg.optional
  const done = items.every(isDone)
  const lastItem = items[items.length - 1]
  const [toast, setToast] = useState(null)
  const [dark, setDark] = useState(false)
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

  // Read the current line aloud, if that's switched on: a recorded voice when
  // there is one, the phone's own voice otherwise.
  const beatNow = beats[cur.beat]
  useEffect(() => {
    if (!state.settings.voice || !beatNow || dark) return stopSpeaking()
    speakLine(beatNow.text, beatNow.speaker, { onStart: () => duck(true), onEnd: () => duck(false) })
  }, [screen.id, cur.beat, state.settings.voice, dark]) // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving the story (another tab): stop reading aloud.
  useEffect(() => stopSpeaking, [])

  // Things that happen on arriving at a screen.
  useEffect(() => {
    setToast(null)
    setChapter(screen.chapter)
    const next = byId[nextId(screen.id, state)]
    const art = next && resolve(next.art, state)
    if (art && art !== 'black') new Image().src = artSrc(art)

    if (screen.light) {
      navigator.vibrate?.(screen.haptic === 'big' ? [60, 40, 160] : 80)
      update((st) => (st.lights.includes(screen.light) ? {} : { lights: [...st.lights, screen.light] }))
    }
    // One-time effects: hours together, the Critic growing back, ladder rungs.
    update((st) => {
      const patch = { maxChapter: Math.max(st.maxChapter || 1, screen.chapter) }
      if (screen.ladder) patch.ladder_rung = Math.max(st.ladder_rung || 0, ...screen.ladder)
      if (st.applied[screen.id]) return patch
      patch.applied = { ...st.applied, [screen.id]: true }
      if (screen.addHours) {
        patch.hours = { ...st.hours }
        for (const [p, h] of Object.entries(screen.addHours)) patch.hours[p] = (patch.hours[p] || 0) + h
      }
      if (screen.criticChange) patch.critic_size = Math.min(5, Math.max(1, st.critic_size + screen.criticChange))
      if (screen.criticSet) patch.critic_size = screen.criticSet
      return patch
    })

    let timer
    if (screen.blackout) {
      setDark(true)
      hush(screen.blackout)
      timer = setTimeout(() => setDark(false), screen.blackout)
    } else setDark(false)

    if (screen.unlock && !state.unlocked[screen.unlock]) {
      update((st) => ({ unlocked: { ...st.unlocked, [screen.unlock]: true } }))
      setToast(UNLOCK_TOAST[screen.unlock])
      const t = setTimeout(() => setToast(null), 3500)
      return () => { clearTimeout(t); clearTimeout(timer) }
    }
    return () => clearTimeout(timer)
  }, [screen.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = (goto) => {
    const to = goto || nextId(screen.id, state)
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
    if (dark) return
    if (beats.length && !cur.full) return setView({ ...cur, full: true })
    if (cur.beat < last) return setView({ ...cur, beat: cur.beat + 1, full: false })
    if (canGoOn) advance(target)
  }

  const markItem = useCallback(
    (id) => update((st) => (st.done[id] ? {} : { done: { ...st.done, [id]: true } })),
    [update]
  )

  // Where "Continue" (or a tap) goes from this screen.
  const cfg = lastItem?.cfg
  let target = nextId(screen.id, state)
  if (cfg?.continueTo) target = cfg.continueTo
  if (cfg?.type === 'choice' && !cfg.pick && !cfg.continueTo) {
    const chosen = cfg.options.find((o) => o.id === state.choices[lastItem.id])
    if (chosen?.goto) target = chosen.goto
  }
  if (cfg?.type === 'quest' && cfg.unlocks) {
    target = chapterData(cfg.unlocks) && isChapterUnlocked(cfg.unlocks, state) ? chapterData(cfg.unlocks).screens[0].id : null
  }
  const canGoOn = !!target && !!byId[target] && done

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

  const line = beatNow && !dark && (
    <Line
      key={`${screen.id}-${cur.beat}`}
      beat={beatNow}
      full={cur.full}
      onDone={() => setView((v) => (v.id === screen.id && v.beat === cur.beat && !v.full ? { ...v, full: true } : v))}
    />
  )

  // Show interactions one at a time: each appears once the one before is done.
  const visible = []
  for (const it of items) {
    visible.push(it)
    if (!isDone(it)) break
  }
  const onPage = screen.layout === 'title' || screen.layout === 'center'
  const letter = screen.showLetter && letterReady(state) && state.future_letter
  const lastIsChoice = cfg?.type === 'choice' || cfg?.type === 'critic-reply'

  return (
    <div className={`player ch-${screen.chapter} ${dark ? 'is-dark' : ''}`} onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="stage" key={screen.id}>
        <Panel screen={screen} state={state}>
          {onPage && line}
        </Panel>
        <div className="below">
          {!onPage && line}
          {letter && wordsDone && (
            <div className="letter-card">
              <p className="note">{T.ui.letterFrom.replace('{date}', formatDate(letter.sealed_at))}</p>
              <p className="hand">{letter.text}</p>
            </div>
          )}
          {items.length > 0 && wordsDone && !dark && (
            <div className="interaction">
              {visible.map((it, i) => (
                <div key={it.id} className="interaction-item">
                  <Interaction
                    cfg={it.cfg}
                    screen={{ ...screen, id: it.id }}
                    state={state}
                    update={update}
                    done={!!state.done[it.id]}
                    markDone={() => markItem(it.id)}
                    advance={i === items.length - 1 ? advance : () => {}}
                    openCrisis={openCrisis}
                  />
                </div>
              ))}
            </div>
          )}
          {items.length > 0 && wordsDone && canGoOn && !lastIsChoice && (
            <button className="continue" onClick={() => advance(target)}>{T.ui.continue}</button>
          )}
          {lastIsChoice && wordsDone && done && canGoOn && (
            <button className="continue subtle" onClick={() => advance(target)}>{T.ui.continue}</button>
          )}
        </div>
        {(!wordsDone || (!items.length && canGoOn)) && !dark && <span className="tap-hint" aria-hidden="true">›</span>}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
