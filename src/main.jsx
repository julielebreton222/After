import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/patrick-hand'
import '@fontsource/caveat'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)

// Fetch every painting quietly in the background once the app has loaded, so
// the whole story works offline later (the service worker keeps them).
import { screens } from './story'
import { artSrc } from './components/ArtFrame.jsx'
window.addEventListener('load', () => {
  const keys = new Set()
  for (const s of screens) {
    const a = s.art
    if (typeof a === 'string') keys.add(a)
    else if (a && typeof a === 'object') Object.entries(a).forEach(([k, v]) => k !== 'by' && keys.add(v))
  }
  keys.delete('black')
  setTimeout(() => keys.forEach((k) => fetch(artSrc(k)).catch(() => {})), 3000)
})
