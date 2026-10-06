import { useEffect } from 'react'
import { formatDate, T } from '../../text'

// NOTEBOOK-BROWSE: the curiosity notebook, opened to read (9.10).
export default function NotebookBrowse({ state, markDone }) {
  useEffect(() => { markDone() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!state.notebook.length) return <p className="note">{T.ui.emptyNotebook}</p>
  return (
    <div className="people browse">
      {state.notebook.map((e, i) => (
        <div key={i} className="page">
          {e.name && <h3 className="hand">{e.name}</h3>}
          <p className="hand">{e.text}</p>
          <span className="note">{formatDate(e.date)}</span>
        </div>
      ))}
    </div>
  )
}
