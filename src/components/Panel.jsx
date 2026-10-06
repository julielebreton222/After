import { useState } from 'react'
import { story } from '../story'
import { say, resolve } from '../text'
import ArtFrame from './ArtFrame.jsx'

const WIDE = { x: 50, y: 50, zoom: 1 }

// One illustrated panel. With "art", shows that painting (public/images/<art>.jpg)
// and moves the camera to the shot for the current line. "art": "black" is an
// intentionally black page. Without art, a placeholder shows the image description.
export default function Panel({ screen, state, beat = 0, focus = null, children }) {
  const [missing, setMissing] = useState(false)
  const description = say(screen.image, state)
  const art = resolve(screen.art, state)
  const shots = resolve(screen.shots, state) || []
  const shot = focus || shots[Math.min(beat, shots.length - 1)] || WIDE
  const glow = screen.light ? 'spill' : art && art !== 'black' && !missing ? 'none' : screen.glow || 'none'
  const showCritic = screen.critic || (screen.words || []).some((w) => w.speaker === 'Critic')
  const painted = art && art !== 'black' && !missing

  return (
    <div className={`panel glow-${glow} layout-${screen.layout || 'normal'} ${painted ? 'has-art' : ''}`}>
      <div className="glow-layer" />
      {painted && (
        <ArtFrame art={art} camera={shot} alt={description} onMissing={() => setMissing(true)}>
          {(screen.points || []).map((id) => {
            const l = story.lights[id]
            return l ? <span key={id} className="point" style={{ left: `${l.x}%`, top: `${l.y}%` }} /> : null
          })}
        </ArtFrame>
      )}
      {!art && (
        <>
          <span className="pid">{screen.id}</span>
          <div className="placeholder"><p>{description}</p></div>
        </>
      )}
      {missing && <div className="placeholder"><p>{description}</p></div>}
      {screen.caption && <span className="caption">{screen.caption}</span>}
      {screen.sfx && <span className="sfx">{screen.sfx}</span>}
      {children && <div className="title-words">{children}</div>}
      {showCritic && (
        <div className="critic" style={{ '--size': state.critic_size }} aria-label={`The Critic, size ${state.critic_size}`}>
          <span className="eye" /><span className="eye" />
        </div>
      )}
    </div>
  )
}
