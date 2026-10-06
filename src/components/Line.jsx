import Typewriter from './Typewriter.jsx'

// One line at a time: the narrator in italics, anyone else in a speech
// bubble, the Critic in grey.
export default function Line({ beat, full, onDone }) {
  const text = <Typewriter text={beat.text} full={full} onDone={onDone} />
  if (beat.speaker === 'narrator') return <p className="narration line-in">{text}</p>
  return (
    <div className={`bubble line-in ${beat.speaker === 'Critic' ? 'bubble-critic' : ''}`}>
      <span className="who">{beat.speaker}</span>
      <span className="line">{text}</span>
    </div>
  )
}
