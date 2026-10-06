import { useCallback, useEffect, useState } from 'react'

// Everything the player does is saved here, on the phone only.
const KEY = 'after-v1'

export const initialState = {
  version: 1,
  firstLaunchDone: false,
  position: '1.1',
  history: [],
  chased: null,
  choices: {},
  lights: [],
  critic_size: 5,
  criticReplied: {},
  hours: {},
  predictions: [],
  notebook: [],
  who_is_theo: [],
  ladder_rung: 0,
  future_letter: null,
  quests: {},
  writes: {},
  done: {},
  unlocked: {},
  savedPerson: null,
  country: null,
  tonight: {},
  pocket: [],
  realPeople: {},
  applied: {},
  habits: {},
  customHabits: [],
  introDone: false,
  heroName: '',
  quoteStyle: null,
  night: {},
  confessions: [],
  habitsTipSeen: false,
  settings: { music: false, voice: false },
}

// Older saves: the therapist used to be called Inès.
function migrate(s) {
  s.lights = (s.lights || []).map((l) => (l === 'ines_lamp' ? 'marieclo_lamp' : l))
  return s
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return saved ? migrate({ ...initialState, ...saved }) : initialState
  } catch {
    return initialState
  }
}

export function useGame() {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable (private mode): the app still works, it just won't remember.
    }
  }, [state])

  // update({...}) merges fields; update(s => ({...})) merges what the function returns.
  const update = useCallback((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])

  const reset = useCallback(() => setState({ ...initialState, firstLaunchDone: true }), [])

  return [state, update, reset]
}
