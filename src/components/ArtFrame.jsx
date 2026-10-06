import { useLayoutEffect, useRef, useState } from 'react'

// A still painting that fills its box (like a photo set to "cover").
// "anchor" { x, y } (percent of the painting) chooses what stays in view when
// the screen is narrower or wider than the painting; the centre by default.
// Children are placed in percent of the painting, so lights and windows stay
// on the right spot whatever the screen size.
const RATIO = 1088 / 1456 // width / height of the paintings

export const artSrc = (key) => `${import.meta.env.BASE_URL}images/${key}.jpg`

export default function ArtFrame({ art, anchor, alt = '', onMissing, children }) {
  const box = useRef(null)
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const el = box.current
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  let frame = null
  if (size && size.h) {
    const width = size.w / size.h > RATIO ? size.w : size.h * RATIO
    const height = width / RATIO
    const ax = anchor?.x ?? 50
    const ay = anchor?.y ?? 50
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
    frame = {
      width,
      height,
      left: clamp(size.w / 2 - (ax / 100) * width, size.w - width, 0),
      top: clamp(size.h / 2 - (ay / 100) * height, size.h - height, 0),
    }
  }

  return (
    <div className="art-box" ref={box}>
      {frame && (
        <div className="art-frame" style={frame}>
          <img className="art-img" src={artSrc(art)} alt={alt} onError={onMissing} draggable="false" />
          {children}
        </div>
      )}
    </div>
  )
}
