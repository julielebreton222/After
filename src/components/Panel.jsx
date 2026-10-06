import { useState } from 'react'
import { story } from '../story'
import { say } from '../text'

// One illustrated panel. Loads /images/<screen-id>.png when it exists;
// otherwise shows a placeholder with the image description.
export default function Panel({ screen, state, children }) {
  const [art, setArt] = useState('loading')
  const description = say(screen.image, state)
  const glow = screen.light ? 'spill' : screen.glow || 'none'
  const showCritic = screen.critic || (screen.words || []).some((w) => w.speaker === 'Critic')

  return (
    <div className={`panel glow-${glow} layout-${screen.layout || 'normal'}`}>
      <div className="glow-layer" />
      <img
        className={`art art-${art}`}
        src={`${import.meta.env.BASE_URL}images/${screen.id}.png`}
        alt={description}
        onLoad={() => setArt('ok')}
        onError={() => setArt('missing')}
      />
      {art !== 'ok' && (
        <>
          <span className="pid">{screen.id}</span>
          <div className="placeholder"><p>{description}</p></div>
        </>
      )}
      {children && <div className="title-words">{children}</div>}
      {(screen.points || []).map((id) => {
        const l = story.lights[id]
        return l ? <span key={id} className="point" style={{ left: `${l.x}%`, top: `${l.y}%` }} /> : null
      })}
      {showCritic && (
        <div className="critic" style={{ '--size': state.critic_size }} aria-label={`The Critic, size ${state.critic_size}`}>
          <span className="eye" /><span className="eye" />
        </div>
      )}
    </div>
  )
}
