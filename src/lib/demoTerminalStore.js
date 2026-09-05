import { useCallback, useState } from 'react'
import { alertSeed, inventorySeed, trackingSeed } from '../data/terminalData.js'

const STORAGE_KEY = 'autoindex.terminal-demo.v1'

const initialState = {
  inventory: inventorySeed,
  tracking: trackingSeed,
  alerts: alertSeed,
  appraisalResults: {},
}

function readStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState
  } catch {
    return initialState
  }
}

export function useDemoTerminalStore() {
  const [state, setState] = useState(readStore)

  const update = useCallback((updater) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* demo state can remain in memory */ }
      return next
    })
  }, [])

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* no-op */ }
    setState(initialState)
  }, [])

  return { state, update, reset }
}
