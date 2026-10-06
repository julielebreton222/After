export default function Quote({ quote }) {
  if (!quote) return null
  return (
    <blockquote className="quote">
      <p className="hand">“{quote.text}”</p>
      <cite className="note">— {quote.by}</cite>
    </blockquote>
  )
}
