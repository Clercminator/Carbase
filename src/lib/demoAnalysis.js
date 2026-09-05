import { getAnalysisScenario, selectScenarioForInput } from '../data/analysisScenarios.js'

const STORAGE_KEY = 'autoindex.demo-analysis.v1'

export function saveDemoAnalysis(input) {
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8) || Date.now().toString(36)
  const payload = {
    schemaVersion: 2,
    analysisId: `demo-${suffix}`,
    scenarioId: selectScenarioForInput(input),
    createdAt: new Date().toISOString(),
    input,
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload
}

export function resolveDemoAnalysis(payload, override) {
  return getAnalysisScenario(override || payload?.scenarioId || selectScenarioForInput(payload?.input))
}

export function loadDemoAnalysis() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function describeAnalysisInput(payload) {
  const input = payload?.input
  if (!input) return ['Vehículo seleccionado', 'Versión por confirmar', 'Cobertura nacional', 'Kilometraje por confirmar']

  if (input.method === 'link') {
    return ['Publicación ingresada', 'Versión por confirmar', 'Región por confirmar', 'Kilometraje por confirmar']
  }

  if (input.method === 'plate') {
    return [`Patente ${input.plate}`, 'Identidad por confirmar', 'Región por confirmar', 'Kilometraje por confirmar']
  }

  return [
    [input.brand, input.model].filter(Boolean).join(' ') || 'Vehículo descrito',
    input.version || 'Versión por confirmar',
    input.region || 'Región por confirmar',
    input.mileage ? `${Number(input.mileage).toLocaleString('es-CL')} km` : 'Kilometraje por confirmar',
  ]
}
