import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// A painting that always fills its box (like a photo "cover"), with a camera
// that zooms towards a point: { x, y } in percent of the painting, and zoom.
// Children are placed in percent of the painting too, so lights and hotspots
// stay on the right window, door or object whatever the screen size.
const RATIO = 1088 / 1456 // width / height of the Chapter 1 paintings
const WIDE = { x: 50, y: 50, zoom: 1 }

export const artSrc = (key) => `${import.meta.env.BASE_URL}images/${key}.jpg`

export default function ArtFrame({ art, camera = WIDE, alt = '', drift = true, onMissing, children }) {
  const box = useRef(null)
  const [size, setSize] = useState(null)
  const [cam, setCam] = useState(WIDE)

  useLayoutEffect(() => {
    const el = box.current
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const width = w / h > RATIO ? w : h * RATIO
      const height = width / RATIO
      setSize({ width, height, w, h })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Start wide, then glide to the shot: every screen opens with a slow push-in.
  useEffect(() => {
    const r = requestAnimationFrame(() => setCam(camera))
    return () => cancelAnimationFrame(r)
  }, [camera.x, camera.y, camera.zoom]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan: slide the painting so the target is as central as the edges allow,
  // then zoom around the target.
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  const frame = size && {
    width: size.width,
    height: size.height,
    left: clamp(size.w / 2 - (cam.x / 100) * size.width, size.w - size.width, 0),
    top: clamp(size.h / 2 - (cam.y / 100) * size.height, size.h - size.height, 0),
    transform: `scale(${cam.zoom})`,
    transformOrigin: `${cam.x}% ${cam.y}%`,
  }

  return (
    <div className="art-box" ref={box}>
      {size && (
        <div className="art-frame" style={frame}>
          <img className={`art-img ${drift ? 'drift' : ''}`} src={artSrc(art)} alt={alt} onError={onMissing} draggable="false" />
          {children}
        </div>
      )}
    </div>
  )
}
