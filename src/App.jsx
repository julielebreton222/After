import { useEffect, useState } from 'react'
import { useGame } from './state'
import Player from './components/Player.jsx'
import FirstLaunch from './components/FirstLaunch.jsx'
import NotOkay from './components/NotOkay.jsx'
import Menu from './components/Menu.jsx'
import SoundMenu from './components/SoundMenu.jsx'
import Toolkit from './components/Toolkit.jsx'
import Habits from './components/Habits.jsx'
import { startMusic, stopMusic } from './audio/music'
import { T } from './text'

export default function App() {
  const [state, update, reset] = useGame()
  // notOkay: null | { crisis: bool, then?: fn }
  const [notOkay, setNotOkay] = useState(null)
  const [menu, setMenu] = useState(false)
  // The two parts of the app: the story, and the toolkit (what to do when, habits).
  const [tab, setTab] = useState('story')

  // Music that was on last time comes back after the first tap
  // (phones don't allow sound before one).
  useEffect(() => {
    if (!state.settings.music) return stopMusic()
    const start = () => startMusic()
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [state.settings.music])

  const openCrisis = (then) => setNotOkay({ crisis: true, then })
  const closeNotOkay = () => {
    const then = notOkay?.then
    setNotOkay(null)
    then?.()
  }

  if (!state.firstLaunchDone) return <FirstLaunch update={update} />

  return (
    <div className="app">
      {tab === 'story' && <Player state={state} update={update} openCrisis={openCrisis} />}
      {tab === 'toolkit' && <Toolkit state={state} />}
      {tab === 'habits' && <Habits state={state} update={update} />}
      <nav className="tab-bar">
        {['story', 'toolkit', 'habits'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} aria-current={tab === t ? 'page' : undefined} onClick={() => setTab(t)}>
            {T.ui['tab' + t[0].toUpperCase() + t.slice(1)]}
          </button>
        ))}
      </nav>
      <button className="top-btn menu-btn" onClick={() => setMenu(true)} aria-label={T.ui.menu}>☰</button>
      <SoundMenu state={state} update={update} />
      <button className="top-btn not-okay-btn" onClick={() => setNotOkay({ crisis: false })}>
        {T.notOkay.button}
      </button>
      {menu && <Menu state={state} update={update} reset={reset} close={() => setMenu(false)} toStory={() => setTab('story')} />}
      {notOkay && <NotOkay state={state} update={update} crisis={notOkay.crisis} close={closeNotOkay} />}
    </div>
  )
}
