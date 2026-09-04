const STORAGE_KEY = 'autoindex.demo-analysis.v1'

export const DEMO_ANALYSIS_ID = 'demo-evaluacion'

export function saveDemoAnalysis(input) {
  const payload = {
    schemaVersion: 1,
    analysisId: DEMO_ANALYSIS_ID,
    createdAt: new Date().toISOString(),
    input,
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload
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
