export const appraisalRows = [
  { id: 'tas-001', vehicle: 'Vehículo A', input: 'Publicación', asking: '$12.300.000', range: '$11.400.000 – $13.600.000', maximum: '$12.800.000', confidence: 'Alta', decision: 'Comprar', result: '—', updated: 'Hace 1 h' },
  { id: 'tas-002', vehicle: 'Vehículo B', input: 'Patente', asking: '$9.800.000', range: '$9.000.000 – $10.600.000', maximum: '$9.900.000', confidence: 'Media', decision: 'Pendiente', result: '—', updated: 'Hace 3 h' },
  { id: 'tas-003', vehicle: 'Vehículo C', input: 'Inventario', asking: '$15.000.000', range: '$14.600.000 – $16.600.000', maximum: '$15.700.000', confidence: 'Alta', decision: 'Comprar', result: 'Comprado', updated: 'Ayer' },
  { id: 'tas-004', vehicle: 'Vehículo D', input: 'Publicación', asking: '$7.250.000', range: '$6.600.000 – $7.900.000', maximum: '$7.300.000', confidence: 'Media', decision: 'Descartar', result: 'Descartado', updated: 'Ayer' },
  { id: 'tas-005', vehicle: 'Vehículo E', input: 'Filtros', asking: '$18.900.000', range: '$17.200.000 – $19.800.000', maximum: '$18.400.000', confidence: 'Alta', decision: 'Comprar', result: 'Pendiente', updated: 'Hace 2 días' },
]

export const inventorySeed = [
  { id: 'inv-001', vehicle: 'Vehículo A', acquisition: 7000000, asking: 7490000, marketLow: 7200000, marketHigh: 7800000, margin: 5.6, days: 12, action: 'Mantener', status: 'Publicado' },
  { id: 'inv-002', vehicle: 'Vehículo B', acquisition: 9500000, asking: 9890000, marketLow: 9200000, marketHigh: 10100000, margin: 2.4, days: 34, action: 'Bajar precio', status: 'Publicado' },
  { id: 'inv-003', vehicle: 'Vehículo C', acquisition: 6200000, asking: 6690000, marketLow: 6000000, marketHigh: 6600000, margin: 3.1, days: 65, action: 'Bajar precio', status: 'Requiere acción' },
  { id: 'inv-004', vehicle: 'Vehículo D', acquisition: 11800000, asking: 11900000, marketLow: 10900000, marketHigh: 11800000, margin: 0.8, days: 78, action: 'Bajar precio', status: 'Requiere acción' },
  { id: 'inv-005', vehicle: 'Vehículo E', acquisition: 8300000, asking: 8790000, marketLow: 8100000, marketHigh: 8800000, margin: 2.9, days: 9, action: 'Mantener', status: 'Publicado' },
]

export const marketSegments = [
  { id: 'A', median: '$15.320.000', range: '$12.800.000 – $18.950.000', supply: 'Alta', demand: 'Alta', liquidity: 82, change: '−0,8%', updated: 'Hoy, 08:30' },
  { id: 'B', median: '$10.850.000', range: '$8.500.000 – $13.900.000', supply: 'Alta', demand: 'Media', liquidity: 66, change: '−1,1%', updated: 'Hoy, 08:30' },
  { id: 'C', median: '$7.250.000', range: '$5.600.000 – $9.100.000', supply: 'Media', demand: 'Media', liquidity: 51, change: '+0,3%', updated: 'Hoy, 08:30' },
  { id: 'D', median: '$4.150.000', range: '$3.200.000 – $5.600.000', supply: 'Media', demand: 'Baja', liquidity: 38, change: '−2,4%', updated: 'Hoy, 08:30' },
  { id: 'E', median: '$2.650.000', range: '$1.800.000 – $3.600.000', supply: 'Alta', demand: 'Baja', liquidity: 24, change: '−3,6%', updated: 'Hoy, 08:30' },
]

export const trackingSeed = [
  { id: 'seg-001', vehicle: 'Vehículo A', source: 'Publicación', initial: '$12.900.000', current: '$12.300.000', change: '−4,7%', events: 2, lastEvent: 'Hace 2 h', state: 'Activo' },
  { id: 'seg-002', vehicle: 'Vehículo B', source: 'Inventario', initial: '$9.890.000', current: '$9.890.000', change: '0,0%', events: 0, lastEvent: 'Sin cambios', state: 'Activo' },
  { id: 'seg-003', vehicle: 'Vehículo C', source: 'Publicación', initial: '$15.600.000', current: '$15.000.000', change: '−3,8%', events: 1, lastEvent: 'Ayer', state: 'Activo' },
  { id: 'seg-004', vehicle: 'Vehículo D', source: 'Publicación', initial: '$7.250.000', current: 'No disponible', change: '—', events: 1, lastEvent: 'Hace 3 días', state: 'Pausado' },
]

export const alertSeed = [
  { id: 'ale-001', name: 'Precio bajo rango de mercado', scope: 'Todo el inventario', channel: 'Terminal', lastTriggered: 'Hace 2 h', enabled: true },
  { id: 'ale-002', name: 'Más de 60 días publicado', scope: 'Inventario activo', channel: 'Correo y terminal', lastTriggered: 'Ayer', enabled: true },
  { id: 'ale-003', name: 'Cambio de precio mayor a 3%', scope: 'Seguimientos', channel: 'Terminal', lastTriggered: 'Hace 2 días', enabled: true },
  { id: 'ale-004', name: 'Nueva oportunidad con liquidez alta', scope: 'Segmentos guardados', channel: 'Correo', lastTriggered: 'Nunca', enabled: false },
]

export const sourceRows = [
  { source: 'Fuente demostrativa A', type: 'Publicaciones', license: 'Por confirmar', freshness: 'Hace 6 h', observations: '18.420', coverage: 'Zona central', state: 'Demostración' },
  { source: 'Fuente demostrativa B', type: 'Distribuidores', license: 'Relación directa', freshness: 'Ayer', observations: '5.180', coverage: 'Cobertura parcial', state: 'Demostración' },
  { source: 'Fuente pública', type: 'Contexto macro', license: 'Uso documentado', freshness: 'Mensual', observations: 'Agregadas', coverage: 'Nacional', state: 'Referencia' },
]

export function formatClp(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value)
}
