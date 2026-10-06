import { useState } from 'react'
import { T } from '../text'
import { startMusic, stopMusic } from '../audio/music'
import { speak, stopSpeaking, voiceSupported } from '../audio/voice'

// The 🔈 button: music on/off and read-aloud on/off. Both start off.
export default function SoundMenu({ state, update }) {
  const [open, setOpen] = useState(false)
  const { music, voice } = state.settings
  const set = (patch) => update((st) => ({ settings: { ...st.settings, ...patch } }))

  const toggleMusic = () => {
    // Started inside the tap itself: phones only allow sound after a tap.
    if (music) stopMusic()
    else startMusic()
    set({ music: !music })
  }
  const toggleVoice = () => {
    if (voice) stopSpeaking()
    else speak(' ', 'narrator') // unlocks speech on iPhone; the current line follows
    set({ voice: !voice })
  }

  return (
    <>
      <button className="top-btn sound-btn" onClick={() => setOpen(!open)} aria-label={T.ui.sound}>
        {music || voice ? '🔊' : '🔈'}
      </button>
      {open && (
        <div className="sound-menu" role="dialog">
          <label className="tick">
            <input type="checkbox" checked={music} onChange={toggleMusic} />
            <span>{T.ui.music}</span>
          </label>
          <label className="tick">
            <input type="checkbox" checked={voice} disabled={!voiceSupported} onChange={toggleVoice} />
            <span>{voiceSupported ? T.ui.voice : T.ui.voiceUnsupported}</span>
          </label>
          <p className="note">{T.ui.silentNote}</p>
        </div>
      )}
    </>
  )
}
