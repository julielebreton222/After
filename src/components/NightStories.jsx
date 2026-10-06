import { useEffect, useRef, useState } from 'react'
import { night, stories, storiesFor, storyById } from '../night'
import { stopMusic, startMusic } from '../audio/music'
import { stopSpeaking } from '../audio/voice'

const U = night.ui
const TIMERS = [10, 20, 30, 0] // minutes; 0 = end of story
const FADE = 8000 // the last seconds before the timer stops, fading out
const time = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '–:––')

// Night stories: "Tonight I feel…", then the stories for that feeling, then
// a quiet player with a sleep timer and a dimmed night mode. Julie's voice
// only: the app's music stops while a story is open.
export default function NightStories({ state, update, close, openNotOkay }) {
  const [feeling, setFeeling] = useState(null)
  const [storyId, setStoryId] = useState(null)
  const mine = state.night || {}
  const save = (patch) => update((st) => ({ night: { ...st.night, ...patch } }))

  // Silence the rest of the app while this is open; bring the music back after.
  useEffect(() => {
    stopSpeaking()
    stopMusic()
    return () => { if (state.settings.music) startMusic() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const story = storyById[storyId]
  const f = night.feelings.find((x) => x.slug === (story?.feeling || feeling))
  const kept = stories.filter((s) => mine.fav?.[s.id])
  const last = storyById[mine.last]

  return (
    <div className="sheet night" role="dialog" aria-modal="true">
      <div className="menu-top">
        <button className="link" onClick={close} aria-label={U.close}>✕</button>
        {(feeling || story) && (
          <button className="link" onClick={() => (story ? setStoryId(null) : setFeeling(null))}>‹ {U.back}</button>
        )}
      </div>
      <button className="night-not-okay" onClick={openNotOkay}>{U.notOkayButton}</button>

      {!feeling && !story && (
        <>
          <h1>{night.question}</h1>
          <p className="note">{night.intro}</p>
          {last && (
            <button className="night-feeling small" onClick={() => setStoryId(last.id)}>
              <span className="note">{U.lastPlayed}</span> {last.title}
            </button>
          )}
          <nav className="night-feelings">
            {night.feelings.map((x) => {
              const n = storiesFor(x.slug).length
              return (
                <button key={x.slug} className={`night-feeling ${n ? '' : 'empty'}`} onClick={() => setFeeling(x.slug)}>
                  <span className="hand">{x.label}</span>
                  <span className="note">{n ? (n === 1 ? U.story : U.stories.replace('{n}', n)) : U.comingSoon}</span>
                </button>
              )
            })}
          </nav>
          {kept.length > 0 && (
            <>
              <h2>{U.favourites}</h2>
              {kept.map((s) => (
                <button key={s.id} className="night-feeling small" onClick={() => setStoryId(s.id)}>{s.title}</button>
              ))}
            </>
          )}
        </>
      )}

      {feeling && !story && (
        <>
          <h1 className="hand">{f.label}</h1>
          <p className="note">{f.line}</p>
          {storiesFor(feeling).length === 0 && (
            <div className="story-card glow-card"><p className="hand">{U.comingSoon}</p></div>
          )}
          {storiesFor(feeling).map((s) => (
            <button key={s.id} className="story-pick" onClick={() => setStoryId(s.id)}>
              <StoryArt story={s} />
              <span className="hand">{s.title}</span>
            </button>
          ))}
        </>
      )}

      {story && (
        <StoryPlayer
          key={story.id}
          story={story}
          feeling={f}
          kept={!!mine.fav?.[story.id]}
          toggleKeep={() => save({ fav: { ...mine.fav, [story.id]: !mine.fav?.[story.id] } })}
          onPlay={() => save({ last: story.id })}
          openNotOkay={openNotOkay}
        />
      )}
    </div>
  )
}

// The illustration, or a plain card with one warm glow.
function StoryArt({ story }) {
  return story.image
    ? <img className="story-art" src={story.image} alt="" />
    : <div className="story-art glow-card" aria-hidden="true" />
}

function StoryPlayer({ story, feeling, kept, toggleKeep, onPlay, openNotOkay }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [dur, setDur] = useState(NaN)
  const [timer, setTimer] = useState(0)
  const [stopAt, setStopAt] = useState(null)
  const [dim, setDim] = useState(false)
  const [showText, setShowText] = useState(false)
  const [ended, setEnded] = useState(false)

  // The lock screen shows what's playing.
  useEffect(() => {
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: story.title, artist: 'Julie', album: night.title })
    }
    return () => audio.current?.pause()
  }, [story])

  // Sleep timer: fade out over the last few seconds, then stop.
  useEffect(() => {
    if (!stopAt || !playing) return
    const tick = setInterval(() => {
      const left = stopAt - Date.now()
      const a = audio.current
      if (!a) return
      if (left <= 0) {
        a.pause()
        a.volume = 1
        setStopAt(null)
      } else if (left < FADE) a.volume = Math.max(0, left / FADE)
    }, 250)
    return () => clearInterval(tick)
  }, [stopAt, playing])

  const chooseTimer = (m) => {
    setTimer(m)
    if (audio.current) audio.current.volume = 1
    setStopAt(m ? Date.now() + m * 60000 : null)
  }

  const toggle = () => {
    const a = audio.current
    if (a.paused) {
      a.volume = 1
      a.play().catch(() => setPlaying(false))
      onPlay()
      setEnded(false)
      if (timer && !stopAt) setStopAt(Date.now() + timer * 60000)
    } else a.pause()
  }

  const safety = feeling?.safety

  return (
    <div className="story-player">
      <StoryArt story={story} />
      <h1 className="hand">{story.title}</h1>

      <audio
        ref={audio}
        src={story.src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setPos(e.target.currentTime)}
        onLoadedMetadata={(e) => setDur(e.target.duration)}
        onEnded={() => { setPlaying(false); setEnded(true); setDim(false) }}
      />

      <button className="play-btn" onClick={toggle} aria-label={playing ? U.pause : U.play}>{playing ? '❚❚' : '▶'}</button>
      <input
        className="seek"
        type="range"
        min="0"
        max={isFinite(dur) ? dur : 0}
        step="1"
        value={pos}
        onChange={(e) => { audio.current.currentTime = Number(e.target.value) }}
        aria-label="Position"
      />
      <p className="note seek-time">{time(pos)} / {time(dur)}</p>

      {safety && ended && (
        <div className="night-safety">
          <p>{U.notOkayEnd}</p>
          <button className="continue" onClick={openNotOkay}>{U.notOkayButton}</button>
        </div>
      )}

      <div className="night-row">
        <span className="note">{U.timer}</span>
        {TIMERS.map((m) => (
          <button key={m} className={`chip ${timer === m ? 'selected' : ''}`} onClick={() => chooseTimer(m)}>
            {m ? U.minutes.replace('{n}', m) : U.endOfStory}
          </button>
        ))}
      </div>

      <div className="night-row">
        <button className="chip" onClick={() => setDim(true)}>☾ {U.nightMode}</button>
        <button className={`chip ${kept ? 'selected' : ''}`} onClick={toggleKeep}>{kept ? `♥ ${U.favourited}` : `♡ ${U.favourite}`}</button>
        {story.text && <button className="chip" onClick={() => setShowText(!showText)}>{showText ? U.hideText : U.readAlong}</button>}
      </div>

      {showText && (
        <div className="story-text">
          {story.text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
        </div>
      )}

      {dim && (
        <div className="night-dim" onClick={() => setDim(false)}>
          <div className="night-glow" aria-hidden="true" />
          <p className="note">{U.nightModeHint}</p>
          <button className="night-not-okay" onClick={(e) => { e.stopPropagation(); openNotOkay() }}>{U.notOkayButton}</button>
        </div>
      )}
    </div>
  )
}
