import { useState } from 'react'
import { useGame } from './state'
import Player from './components/Player.jsx'
import FirstLaunch from './components/FirstLaunch.jsx'
import NotOkay from './components/NotOkay.jsx'
import Menu from './components/Menu.jsx'
import { T } from './text'

export default function App() {
  const [state, update, reset] = useGame()
  // notOkay: null | { crisis: bool, then?: fn }
  const [notOkay, setNotOkay] = useState(null)
  const [menu, setMenu] = useState(false)

  const openCrisis = (then) => setNotOkay({ crisis: true, then })
  const closeNotOkay = () => {
    const then = notOkay?.then
    setNotOkay(null)
    then?.()
  }

  if (!state.firstLaunchDone) return <FirstLaunch update={update} />

  return (
    <div className="app">
      <Player state={state} update={update} openCrisis={openCrisis} />
      <button className="top-btn menu-btn" onClick={() => setMenu(true)} aria-label={T.ui.menu}>☰</button>
      <button className="top-btn not-okay-btn" onClick={() => setNotOkay({ crisis: false })}>
        {T.notOkay.button}
      </button>
      {menu && <Menu state={state} update={update} reset={reset} close={() => setMenu(false)} />}
      {notOkay && <NotOkay state={state} update={update} crisis={notOkay.crisis} close={closeNotOkay} />}
    </div>
  )
}
