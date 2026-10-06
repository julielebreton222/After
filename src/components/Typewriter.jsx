import { useEffect, useState } from 'react'

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Types text out letter by letter. `full` shows it all at once (after a tap).
// Calls onDone when the whole line is visible.
export default function Typewriter({ text, full, msPerChar = 32, onDone }) {
  const [n, setN] = useState(full || reduceMotion() ? text.length : 0)

  useEffect(() => {
    if (full) setN(text.length)
  }, [full, text.length])

  useEffect(() => {
    if (n >= text.length) {
      onDone?.()
      return
    }
    // A little pause after punctuation, like a breath.
    const ch = text[n - 1]
    const wait = /[.!?…]/.test(ch) ? msPerChar * 8 : /[,;:]/.test(ch) ? msPerChar * 4 : msPerChar
    const t = setTimeout(() => setN((x) => x + 1), wait)
    return () => clearTimeout(t)
  }, [n, text, msPerChar]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="typewriter">
      <span>{text.slice(0, n)}</span>
      <span className="unrevealed" aria-hidden="true">{text.slice(n)}</span>
    </span>
  )
}
