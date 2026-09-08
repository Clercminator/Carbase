import { useCallback, useState } from 'react'
import { alertSeed, inventorySeed, trackingSeed } from '../data/terminalData.js'

const STORAGE_KEY = 'autoindex.terminal-demo.v1'

const initialState = {
  inventory: inventorySeed,
  tracking: trackingSeed,
  alerts: alertSeed,
  appraisalResults: {},
}

function readStore(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState
  } catch {
    return initialState
  }
}

export function useDemoTerminalStore(userId) {
  const storageKey = `${STORAGE_KEY}:${userId}`
  const [state, setState] = useState(() => readStore(storageKey))

  const update = useCallback((updater) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* demo state can remain in memory */ }
      return next
    })
  }, [storageKey])

  const reset = useCallback(() => {
    try { localStorage.removeItem(storageKey) } catch { /* no-op */ }
    setState(initialState)
  }, [storageKey])

  return { state, update, reset }
}
