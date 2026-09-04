import {
  BadgeHelp,
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
  FileSearch,
  Gauge,
  GitCompareArrows,
  CircleDollarSign,
  ScanSearch,
  ShieldCheck,
  Tag,
  Timer,
  TrendingUp,
} from 'lucide-react'

export const quickActions = [
  { label: 'Analizar publicación', Icon: FileSearch },
  { label: 'Ver mercado', Icon: BarChart3 },
  { label: 'Tasar mi auto', Icon: Tag },
  { label: 'Comparar versiones', Icon: GitCompareArrows },
  { label: 'Tendencias de precio', Icon: TrendingUp },
  { label: 'Mi inventario', Icon: Boxes },
  { label: 'Preguntas frecuentes', Icon: BadgeHelp },
]

export const summaryRows = [
  { label: 'Precio publicado', code: 'PRC-01', value: '$18.900.000', detail: '+4,7%', tone: 'blue', Icon: CircleDollarSign },
  { label: 'Diferencia vs. mercado', code: 'DIF-02', value: '+$800.000', detail: '+4,6%', tone: 'teal', Icon: ChartNoAxesCombined },
  { label: 'Precio máximo recomendado', code: 'REC-03', value: '$17.900.000', detail: 'Referencia', tone: 'amber', Icon: TrendingUp },
  { label: 'Liquidez de mercado', code: 'LIQ-04', value: 'Alta', detail: '85/100', tone: 'violet', Icon: Gauge },
  { label: 'Días estimados de venta', code: 'VEN-05', value: '25 días', detail: '−5 días', tone: 'blue', Icon: Timer },
  { label: 'Confianza de datos', code: 'DAT-06', value: 'Alta', detail: '90/100', tone: 'teal', Icon: ShieldCheck },
]

export const scoreRows = [
  { label: 'Precio', value: 45, tone: 'amber' },
  { label: 'Kilometraje', value: 72, tone: 'teal' },
  { label: 'Liquidez de mercado', value: 80, tone: 'teal' },
  { label: 'Confiabilidad del modelo', value: 70, tone: 'blue' },
  { label: 'Confianza de datos', value: 90, tone: 'teal' },
]

export const comparables = [
  { version: 'Configuración A', mileage: 'Rango bajo', region: 'Zona central', price: '$17.680.000', updated: 'Hace 2 h', similarity: 94, included: true },
  { version: 'Configuración B', mileage: 'Rango medio', region: 'Zona central', price: '$17.950.000', updated: 'Hace 5 h', similarity: 91, included: true },
  { version: 'Configuración C', mileage: 'Rango medio', region: 'Otra región', price: '$18.100.000', updated: 'Ayer', similarity: 84, included: true },
  { version: 'Configuración D', mileage: 'Rango alto', region: 'Zona central', price: '$17.490.000', updated: 'Hace 2 días', similarity: 76, included: false },
]

export const resultDefaults = {
  vehicle: 'Vehículo seleccionado',
  version: 'Versión',
  region: 'Región',
  mileage: 'Kilometraje',
  Icon: ScanSearch,
}
