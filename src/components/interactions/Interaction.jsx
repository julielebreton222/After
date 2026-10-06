import Choice from './Choice.jsx'
import TapObjects from './TapObjects.jsx'
import Write from './Write.jsx'
import Timer from './Timer.jsx'
import Hold from './Hold.jsx'
import Drag from './Drag.jsx'
import Rate from './Rate.jsx'
import CriticReply from './CriticReply.jsx'
import Quest from './Quest.jsx'
import NotebookEntry from './NotebookEntry.jsx'
import Seal from './Seal.jsx'

// The interaction types from the build spec, by the "type" used in the story files.
const TYPES = {
  choice: Choice,
  'tap-objects': TapObjects,
  write: Write,
  timer: Timer,
  hold: Hold,
  drag: Drag,
  rate: Rate,
  'critic-reply': CriticReply,
  quest: Quest,
  notebook: NotebookEntry,
  seal: Seal,
}

export default function Interaction(props) {
  const Component = TYPES[props.cfg.type]
  if (!Component) return <p className="prompt">Unknown interaction type: {props.cfg.type}</p>
  return <Component {...props} />
}
