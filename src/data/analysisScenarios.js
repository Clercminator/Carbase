import { comparables as defaultComparables } from './sampleData.js'

const high = {
  id: 'high',
  status: 'estimated',
  label: 'Estimación',
  notice: 'Estimación de mercado, no inspección. Revisa los comparables y las limitaciones antes de decidir.',
  price: { range: '$17,4M – $18,1M', delta: '+$800 mil sobre mercado', published: '$18.900.000', difference: '+$800.000', maximum: '$17.900.000' },
  liquidity: { value: 'Alta', detail: '85/100', days: '25 días', daysDetail: '−5 días' },
  confidence: { level: 'Alta', score: 86, sampleSize: 24, freshness: 'Hace 6 horas', coverage: 'Región Metropolitana', reasons: ['24 comparables válidos', 'Baja dispersión de precios', 'Cobertura geográfica adecuada'] },
  score: { total: 61, status: 'Caro', price: 45, mileage: 72, liquidity: 80, reliability: 70, confidence: 86 },
  adjustments: { mileage: '−1,8% respecto de la muestra comparable', region: 'Cobertura principal en Región Metropolitana', version: 'Versión equivalente; condición pendiente de inspección' },
  changeFactors: 'Una inspección, historial incompleto, equipamiento no identificado o cambios recientes de mercado.',
  comparables: defaultComparables,
}

const medium = {
  ...high,
  id: 'medium',
  price: { range: '$9,0M – $10,6M', delta: 'Dentro del rango estimado', published: '$9.800.000', difference: '+$120.000', maximum: '$9.900.000' },
  liquidity: { value: 'Media', detail: '63/100', days: '38 días', daysDetail: '+4 días' },
  confidence: { level: 'Media', score: 67, sampleSize: 14, freshness: 'Hace 18 horas', coverage: 'Cobertura regional parcial', reasons: ['14 comparables utilizables', 'Versión todavía por confirmar', 'Cobertura regional parcial'] },
  score: { total: 73, status: 'Razonable', price: 76, mileage: 68, liquidity: 63, reliability: 71, confidence: 67 },
  adjustments: { mileage: 'Sin ajuste hasta confirmar kilometraje', region: '−0,7% por menor cobertura regional', version: 'Identidad inferida desde la patente; versión por confirmar' },
  changeFactors: 'Confirmar versión, kilometraje, región de uso y estado mecánico podría estrechar el rango.',
  comparables: defaultComparables.slice(0, 3),
}

const low = {
  ...high,
  id: 'low',
  price: { range: '$11,1M – $14,2M', delta: 'Rango amplio por información incompleta', published: 'Por confirmar', difference: 'No calculada', maximum: '$12.900.000' },
  liquidity: { value: 'Baja', detail: '38/100', days: '57 días', daysDetail: '+19 días' },
  confidence: { level: 'Baja', score: 42, sampleSize: 7, freshness: 'Hace 3 días', coverage: 'Cobertura geográfica limitada', reasons: ['7 comparables utilizables', 'Versión y kilometraje incompletos', 'Alta dispersión de precios'] },
  score: { total: 49, status: 'Revisar', price: 52, mileage: 35, liquidity: 38, reliability: 61, confidence: 42 },
  adjustments: { mileage: 'No disponible', region: '+1,4% con cobertura limitada', version: 'Configuración exacta pendiente' },
  changeFactors: 'Agregar versión, año, kilometraje y condición puede cambiar materialmente la recomendación.',
  comparables: defaultComparables.slice(0, 2),
}

export const analysisScenarios = {
  high,
  medium,
  low,
  insufficient: {
    id: 'insufficient', status: 'insufficient', label: 'Datos insuficientes',
    title: 'Todavía no podemos estimar un precio responsable',
    copy: 'La identidad o la muestra comparable no alcanza el mínimo necesario. Completa la versión, el año, el kilometraje y la región para volver a intentarlo.',
  },
  unavailable: {
    id: 'unavailable', status: 'unavailable', label: 'Publicación no disponible',
    title: 'No pudimos leer esta publicación',
    copy: 'El enlace puede haber expirado, estar restringido o pertenecer a una fuente todavía no compatible. Puedes describir el vehículo manualmente.',
  },
  error: {
    id: 'error', status: 'error', label: 'Servicio temporalmente no disponible',
    title: 'El análisis no pudo completarse',
    copy: 'Conservamos la información ingresada en esta sesión. Intenta nuevamente en unos minutos o usa otro método de entrada.',
  },
}

export function selectScenarioForInput(input) {
  if (!input) return 'medium'
  if (input.method === 'link' && /retirada|unsupported|no-disponible/i.test(input.publicationUrl || '')) return 'unavailable'
  if (input.method === 'plate' && String(input.plate || '').endsWith('0')) return 'insufficient'
  if (input.method === 'plate') return 'medium'
  if (input.method === 'filters' && input.version && input.year && input.mileage) return 'high'
  if (input.method === 'filters') return 'low'
  return 'high'
}

export function getAnalysisScenario(id) {
  return analysisScenarios[id] || analysisScenarios.medium
}
