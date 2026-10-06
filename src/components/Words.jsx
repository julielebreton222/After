import { say } from '../text'

// Narrator lines in italics; anyone else in a speech bubble; the Critic in grey.
export default function Words({ words = [], state }) {
  if (!words.length) return null
  return (
    <div className="words">
      {words.map((w, i) =>
        w.speaker === 'narrator' ? (
          <p key={i} className="narration">{say(w.text, state)}</p>
        ) : (
          <div key={i} className={`bubble ${w.speaker === 'Critic' ? 'bubble-critic' : ''}`}>
            <span className="who">{w.speaker}</span>
            <span className="line">{say(w.text, state)}</span>
          </div>
        )
      )}
    </div>
  )
}
