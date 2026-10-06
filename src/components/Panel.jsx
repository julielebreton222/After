import { useState } from 'react'
import { story, byId } from '../story'
import { say, resolve } from '../text'
import ArtFrame from './ArtFrame.jsx'
import LightMap from './LightMap.jsx'
import { Ladder, FriendCard, Chart, MapItems, NotebookPage, Kept, People } from './Overlays.jsx'

// One illustrated panel. "art" names a still painting (public/images/<art>.jpg);
// "art": "black" is a page that is black on purpose. Without art, a placeholder
// shows the image description. Everything else is optional decoration that
// the story files switch on per screen.
export default function Panel({ screen, state, children }) {
  const [missing, setMissing] = useState(false)
  const description = say(screen.image, state)
  const art = resolve(screen.art, state)
  const painted = art && art !== 'black' && !missing
  const glow = screen.light ? 'spill' : painted ? 'none' : screen.glow || 'none'
  const showCritic = screen.critic || (screen.words || []).some((w) => w.speaker === 'Critic')
  const classes = [
    'panel', `glow-${glow}`, `layout-${screen.layout || 'normal'}`,
    painted && 'has-art', screen.frame && `frame-${screen.frame}`,
    screen.reveal && 'reveal', screen.bloom && 'bloom', screen.blackout && 'blackout',
  ].filter(Boolean).join(' ')

  const points = (screen.points || []).map((id) => {
    const l = story.lights[id]
    const pos = l && story.people[l.person]?.window
    return pos ? <span key={id} className="point" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} /> : null
  })

  return (
    <div className={classes} style={screen.blackout ? { '--blackout': `${screen.blackout}ms` } : undefined}>
      <div className="glow-layer" />
      {painted && (
        <ArtFrame art={art} anchor={screen.anchor} alt={description} onMissing={() => setMissing(true)}>
          {points}
        </ArtFrame>
      )}
      {!art && (
        <>
          <span className="pid">{screen.id}</span>
          <div className="placeholder"><p>{description}</p></div>
        </>
      )}
      {missing && <div className="placeholder"><p>{description}</p></div>}
      {(screen.dots || []).map(([x, y], i) => <span key={i} className="point" style={{ left: `${x}%`, top: `${y}%` }} />)}
      {screen.caption && <span className="caption">{say(screen.caption, state)}</span>}
      {screen.sfx && <span className="sfx">{screen.sfx}</span>}

      {screen.showLightMap && <div className="overlay-center"><LightMap state={state} compact /></div>}
      {screen.showNotebook && <div className="overlay-center"><NotebookPage source={screen.showNotebook} state={state} /></div>}
      {screen.showMap && <div className="overlay-center"><MapItems state={state} /></div>}
      {screen.showFriend && <div className="overlay-bottom"><FriendCard person={screen.showFriend} state={state} /></div>}
      {screen.showChart && <div className="overlay-center"><Chart which={screen.showChart} state={state} /></div>}
      {screen.showKept && (
        <div className="overlay-bottom">
          <Kept screenId={screen.showKept} state={state} items={byId[screen.showKept]?.interaction?.items || []} />
        </div>
      )}
      {screen.showPeople && <div className="overlay-bottom"><People state={state} /></div>}
      {screen.ladder && <Ladder lit={screen.ladder} state={state} />}

      {children && <div className="title-words">{children}</div>}
      {showCritic && (
        <div className="critic" style={{ '--size': state.critic_size }} aria-label={`The Critic, size ${state.critic_size}`}>
          <span className="eye" /><span className="eye" />
        </div>
      )}
    </div>
  )
}
