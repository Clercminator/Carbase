import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, Bell, CalendarDays, Check, ChevronDown, ChevronRight,
  Clock3, Database, Download, FileCheck2, Gauge, Globe2, Link2, ListChecks,
  Pause, Play, Plus, RefreshCcw, Save, ShieldCheck, TrendingDown, TrendingUp, Upload, X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { appraisalRows, formatClp, marketSegments, sourceRows } from '../../data/terminalData.js'
import MarketChart from './MarketChart.jsx'
import TerminalModal from './TerminalModal.jsx'

export function TerminalContent({ view, query, store, updateStore, onNewAppraisal, notify }) {
  if (view === 'tasaciones') return <AppraisalsView query={query} store={store} updateStore={updateStore} onNewAppraisal={onNewAppraisal} notify={notify} />
  if (view === 'mercado') return <MarketView query={query} notify={notify} />
  if (view === 'inventario') return <InventoryView query={query} store={store} updateStore={updateStore} notify={notify} />
  if (view === 'seguimientos') return <TrackingView query={query} store={store} updateStore={updateStore} notify={notify} />
  if (view === 'alertas') return <AlertsView query={query} store={store} updateStore={updateStore} notify={notify} />
  return <DataView />
}

const summaryIcons = { blue: TrendingUp, teal: Check, amber: CalendarDays, violet: Gauge }

function ViewHeading({ title, copy, children }) {
  return <div className="terminal-view-heading"><div><h1>{title}</h1><p>{copy}</p></div><div className="view-heading-actions">{children}</div></div>
}

function SummaryStrip({ items }) {
  return <section className="terminal-summary-strip">{items.map(({ label, value, note, tone = 'blue' }) => {
    const Icon = summaryIcons[tone]
    return <article key={label}><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div><i className={`summary-strip-icon tone-${tone}`}><Icon /></i></article>
  })}</section>
}

function DemoLabel() {
  return <span className="terminal-demo-label"><i /> Datos demostrativos</span>
}

function AppraisalsView({ query, store, updateStore, onNewAppraisal, notify }) {
  const [tab, setTab] = useState('Todas')
  const [selectedId, setSelectedId] = useState(null)
  const [result, setResult] = useState('Comprado')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [preparationCost, setPreparationCost] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const rows = useMemo(() => appraisalRows.map((row) => ({ ...row, result: store.appraisalResults[row.id]?.result || row.result })).filter((row) => {
    const matchesQuery = Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesTab = tab === 'Todas' || (tab === 'Pendientes' && row.result === 'Pendiente') || (tab === 'Completadas' && ['Comprado', 'Descartado'].includes(row.result)) || (tab === 'Sin resultado' && row.result === '—')
    return matchesQuery && matchesTab
  }), [query, store.appraisalResults, tab])

  const saveResult = (event) => {
    event.preventDefault()
    if (!selectedId) return
    updateStore((current) => ({ ...current, appraisalResults: { ...current.appraisalResults, [selectedId]: { result, purchasePrice, preparationCost, date, notes } } }))
    notify('Resultado guardado localmente')
    setSelectedId(null)
  }

  return <main className={`terminal-view terminal-view--drawer${selectedId ? ' has-drawer' : ''}`}>
    <div className="terminal-view-primary">
      <ViewHeading title="Tasaciones" copy="Analiza oportunidades y registra el resultado de cada decisión.">
        <button type="button" onClick={() => exportRows(appraisalRows, 'tasaciones-demo.csv', notify)}><Download /> Exportar CSV</button>
        <button className="primary" type="button" onClick={onNewAppraisal}><Plus /> Nueva tasación</button>
      </ViewHeading>
      <SummaryStrip items={[
        { label: 'Tasaciones este mes', value: '128', note: '+18% vs. mes anterior', tone: 'blue' },
        { label: 'Compras recomendadas', value: '52', note: '41% del total', tone: 'amber' },
        { label: 'Resultados registrados', value: `${86 + Object.keys(store.appraisalResults).length}`, note: 'Necesarios para calibrar', tone: 'teal' },
        { label: 'Precisión por validar', value: '—', note: 'Pendiente de datos reales', tone: 'violet' },
      ]} />
      <section className="terminal-data-panel">
        <div className="terminal-tabs">{['Todas', 'Pendientes', 'Completadas', 'Sin resultado'].map((item) => <button className={tab === item ? 'is-active' : ''} key={item} type="button" onClick={() => setTab(item)}>{item}</button>)}</div>
        <div className="terminal-filter-row"><InlineSelect label="Método de entrada" /><InlineSelect label="Confianza" /><InlineSelect label="Últimos 30 días" /><DemoLabel /></div>
        <div className="terminal-data-table"><table><thead><tr><th>Vehículo</th><th>Entrada</th><th>Precio publicado</th><th>Rango estimado</th><th>Máximo recomendado</th><th>Confianza</th><th>Decisión</th><th>Resultado</th><th>Actualizado</th></tr></thead><tbody>
          {rows.map((row) => <tr className={selectedId === row.id ? 'is-selected' : ''} key={row.id} onClick={() => setSelectedId(row.id)}><td><strong>{row.vehicle}</strong></td><td>{row.input}</td><td>{row.asking}</td><td>{row.range}</td><td>{row.maximum}</td><td><Status value={row.confidence} /></td><td><Status value={row.decision} /></td><td><Status value={row.result} /></td><td>{row.updated}</td></tr>)}
          {!rows.length ? <EmptyRow columns={9} /> : null}
        </tbody></table></div>
      </section>
      <p className="local-demo-note"><Database /> Los cambios de esta demostración se guardan únicamente en este navegador.</p>
    </div>
    {selectedId ? <aside className="terminal-detail-drawer"><header><div><h2>Registrar resultado</h2><p>{appraisalRows.find((row) => row.id === selectedId)?.vehicle}</p></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Cerrar detalle"><X /></button></header><form onSubmit={saveResult}>
      <Segmented value={result} onChange={setResult} options={['Comprado', 'Descartado', 'Pendiente']} />
      <DemoField label="Precio de compra" value={purchasePrice} onChange={setPurchasePrice} placeholder="$ 0" inputMode="numeric" />
      <DemoField label="Costo de preparación" value={preparationCost} onChange={setPreparationCost} placeholder="$ 0" inputMode="numeric" />
      <DemoField label="Fecha" value={date} onChange={setDate} type="date" />
      <label className="terminal-form-field"><span>Notas internas</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength="500" placeholder="Agrega observaciones relevantes…" /><small>{notes.length}/500</small></label>
      <label className="terminal-checkbox"><input type="checkbox" defaultChecked /> Usar resultado para mejorar el modelo</label>
      <button className="terminal-save-button" type="submit"><Save /> Guardar resultado</button>
    </form></aside> : null}
  </main>
}

function InventoryView({ query, store, updateStore, notify }) {
  const [filter, setFilter] = useState('Todos')
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const fileRef = useRef(null)
  const [form, setForm] = useState({ vehicle: '', acquisition: '', asking: '' })
  const rows = useMemo(() => store.inventory.filter((row) => {
    const matchesQuery = Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'Todos' || (filter === 'Requiere acción' && row.status === 'Requiere acción') || (filter === 'Más de 60 días' && row.days > 60)
    return matchesQuery && matchesFilter
  }), [filter, query, store.inventory])
  const selected = store.inventory.find((row) => row.id === selectedId)
  const capital = store.inventory.reduce((sum, row) => sum + row.acquisition, 0)

  const addVehicle = (event) => {
    event.preventDefault()
    const nextNumber = store.inventory.length + 1
    const acquisition = Number(form.acquisition)
    const asking = Number(form.asking)
    if (!form.vehicle || !acquisition || !asking) return
    const next = { id: `inv-${Date.now()}`, vehicle: form.vehicle || `Vehículo ${nextNumber}`, acquisition, asking, marketLow: Math.round(asking * .94), marketHigh: Math.round(asking * 1.04), margin: Number((((asking - acquisition) / asking) * 100).toFixed(1)), days: 0, action: 'Revisar al recibir datos', status: 'Pendiente' }
    updateStore((current) => ({ ...current, inventory: [next, ...current.inventory] }))
    setShowAdd(false); setForm({ vehicle: '', acquisition: '', asking: '' }); notify('Vehículo agregado al inventario demo')
  }

  const importCsv = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).filter(Boolean)
      notify(`${Math.max(0, lines.length - 1)} filas leídas. La importación real se conectará al backend.`)
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  return <main className={`terminal-view terminal-view--drawer${selected ? ' has-drawer' : ''}`}><div className="terminal-view-primary">
    <ViewHeading title="Inventario" copy="Controla precio, permanencia y capital inmovilizado.">
      <input className="sr-only" ref={fileRef} type="file" accept=".csv,text/csv" onChange={importCsv} />
      <button type="button" onClick={() => fileRef.current?.click()}><Upload /> Importar CSV</button>
      <button className="primary" type="button" onClick={() => setShowAdd(true)}><Plus /> Agregar vehículo</button>
    </ViewHeading>
    <SummaryStrip items={[
      { label: 'Unidades activas', value: store.inventory.length, note: 'Vehículos registrados', tone: 'blue' },
      { label: 'Capital en inventario', value: formatClp(capital), note: 'Valor de adquisición', tone: 'teal' },
      { label: 'Permanencia mediana', value: '34 días', note: 'Datos demostrativos', tone: 'amber' },
      { label: 'Sobre precio de mercado', value: '2,8%', note: 'Promedio ilustrativo', tone: 'violet' },
    ]} />
    <section className="terminal-data-panel"><div className="inventory-toolbar"><div className="terminal-tabs">{['Todos', 'Requiere acción', 'Más de 60 días'].map((item) => <button className={filter === item ? 'is-active' : ''} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div><DemoLabel /></div>
      <div className="terminal-data-table"><table><thead><tr><th>Vehículo</th><th>Precio compra</th><th>Precio publicado</th><th>Rango de mercado</th><th>Margen estimado</th><th>Días</th><th>Acción recomendada</th><th>Estado</th></tr></thead><tbody>{rows.map((row) => <tr className={selectedId === row.id ? 'is-selected' : ''} key={row.id} onClick={() => setSelectedId(row.id)}><td><strong>{row.vehicle}</strong></td><td>{formatClp(row.acquisition)}</td><td>{formatClp(row.asking)}</td><td>{formatClp(row.marketLow)} – {formatClp(row.marketHigh)}</td><td className="positive-value">+{row.margin}%</td><td>{row.days}</td><td>{row.action}</td><td><Status value={row.status} /></td></tr>)}{!rows.length ? <EmptyRow columns={8} /> : null}</tbody></table></div>
    </section>
  </div>{selected ? <InventoryDrawer row={selected} onClose={() => setSelectedId(null)} notify={notify} /> : null}
    {showAdd ? <TerminalModal title="Agregar vehículo" onClose={() => setShowAdd(false)}><form className="terminal-modal-form" onSubmit={addVehicle}><DemoField label="Identificador interno" value={form.vehicle} onChange={(value) => setForm((current) => ({ ...current, vehicle: value }))} placeholder="Ej. Vehículo F" /><DemoField label="Precio de compra" value={form.acquisition} onChange={(value) => setForm((current) => ({ ...current, acquisition: value.replace(/\D/g, '') }))} placeholder="CLP" inputMode="numeric" /><DemoField label="Precio publicado" value={form.asking} onChange={(value) => setForm((current) => ({ ...current, asking: value.replace(/\D/g, '') }))} placeholder="CLP" inputMode="numeric" /><button className="terminal-save-button" type="submit"><Plus /> Agregar al inventario</button></form></TerminalModal> : null}
  </main>
}

function InventoryDrawer({ row, onClose, notify }) {
  return <aside className="terminal-detail-drawer"><header><div><h2>{row.vehicle}</h2><p><Status value={row.status} /></p></div><button type="button" onClick={onClose} aria-label="Cerrar detalle"><X /></button></header><div className="drawer-section"><h3>Precios y objetivos</h3><dl><div><dt>Precio de compra</dt><dd>{formatClp(row.acquisition)}</dd></div><div><dt>Costo de preparación</dt><dd>$250.000</dd></div><div><dt>Margen objetivo</dt><dd>8,0%</dd></div><div><dt>Precio recomendado</dt><dd className="positive-value">{formatClp(row.marketHigh)}</dd></div><div><dt>Precio publicado actual</dt><dd>{formatClp(row.asking)}</dd></div><div><dt>Días en inventario</dt><dd>{row.days} días</dd></div></dl></div><div className="drawer-actions"><h3>Registrar resultado</h3><button className="terminal-save-button" type="button" onClick={() => notify('Venta preparada para registrar')}><FileCheck2 /> Registrar venta</button><button type="button" onClick={() => notify('Cambio de precio preparado')}><TrendingDown /> Registrar cambio de precio</button><button className="danger" type="button" onClick={() => notify('Acción de descarte preparada')}><X /> Descartar</button></div></aside>
}

function MarketView({ query, notify }) {
  const [period, setPeriod] = useState('30D')
  const rows = marketSegments.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  return <main className="terminal-view"><ViewHeading title="Mercado" copy="Explora precios, oferta, demanda y liquidez por segmento."><DemoLabel /></ViewHeading>
    <section className="market-filters">{['Tipo de vehículo', 'Marca', 'Modelo', 'Versión', 'Región', 'Periodo'].map((label) => <InlineSelect label={label} key={label} />)}<button type="button" onClick={() => notify('Filtros aplicados a los datos demostrativos')}>Aplicar filtros</button></section>
    <SummaryStrip items={[{ label: 'Precio mediano', value: '$12.450.000', note: '0,0% vs. 30 días', tone: 'teal' }, { label: 'Publicaciones activas', value: '28.364', note: '+4,2% vs. 30 días', tone: 'blue' }, { label: 'Días estimados de venta', value: '34', note: 'Sin variación', tone: 'amber' }, { label: 'Variación de precio', value: '−1,2%', note: 'vs. 30 días', tone: 'violet' }]} />
    <div className="market-main-grid"><section className="market-chart-panel"><header><div><h2>Precio y oferta en el tiempo</h2><p><span /> Precio mediano <i /> Publicaciones activas</p></div><div>{['7D', '30D', '90D', '12M'].map((item) => <button className={period === item ? 'is-active' : ''} key={item} type="button" onClick={() => setPeriod(item)}>{item}</button>)}</div></header><MarketChart /></section><section className="liquidity-list"><h2>Liquidez por segmento</h2>{marketSegments.map((row) => <div key={row.id}><span className="segment-badge">{row.id}</span><span className="mini-score"><i style={{ width: `${row.liquidity}%` }} /></span><strong>{row.liquidity}</strong>{row.liquidity >= 50 ? <TrendingUp /> : <TrendingDown />}</div>)}</section></div>
    <section className="terminal-data-panel market-opportunities"><h2>Oportunidades del mercado</h2><div className="terminal-data-table"><table><thead><tr><th>Segmento</th><th>Precio mediano</th><th>Rango</th><th>Oferta</th><th>Demanda</th><th>Liquidez</th><th>Variación 30 días</th><th>Actualizado</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><span className="segment-badge">{row.id}</span></td><td>{row.median}</td><td>{row.range}</td><td><Status value={row.supply} /></td><td><Status value={row.demand} /></td><td><span className="score-cell"><i><span style={{ width: `${row.liquidity}%` }} /></i>{row.liquidity}</span></td><td className={row.change.startsWith('+') ? 'negative-value' : 'positive-value'}>{row.change}</td><td>{row.updated}</td></tr>)}</tbody></table></div></section>
    <section className="market-disclosure"><span><RefreshCcw /><strong>Actualización</strong> Datos ilustrativos</span><span><Database /><strong>Observaciones</strong> Pendientes de integración</span><span><Globe2 /><strong>Cobertura</strong> Por validar</span></section>
  </main>
}

function TrackingView({ query, store, updateStore, notify }) {
  const [showAdd, setShowAdd] = useState(false)
  const [url, setUrl] = useState('')
  const rows = store.tracking.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  const toggle = (id) => updateStore((current) => ({ ...current, tracking: current.tracking.map((row) => row.id === id ? { ...row, state: row.state === 'Activo' ? 'Pausado' : 'Activo' } : row) }))
  const add = (event) => { event.preventDefault(); if (!url) return; updateStore((current) => ({ ...current, tracking: [{ id: `seg-${Date.now()}`, vehicle: `Vehículo ${current.tracking.length + 1}`, source: 'Publicación', initial: 'Pendiente', current: 'Pendiente', change: '—', events: 0, lastEvent: 'Recién agregado', state: 'Activo' }, ...current.tracking] })); setUrl(''); setShowAdd(false); notify('Seguimiento agregado localmente') }
  return <main className="terminal-view"><ViewHeading title="Seguimientos" copy="Monitorea publicaciones y recibe cambios relevantes de precio."><button className="primary" type="button" onClick={() => setShowAdd(true)}><Plus /> Nuevo seguimiento</button></ViewHeading><SummaryStrip items={[{ label: 'Seguimientos activos', value: store.tracking.filter((row) => row.state === 'Activo').length, note: 'Revisión demostrativa', tone: 'blue' }, { label: 'Cambios detectados', value: '4', note: 'Últimos 7 días', tone: 'teal' }, { label: 'Publicaciones retiradas', value: '1', note: 'Requiere revisión', tone: 'amber' }, { label: 'Ahorro observado', value: '$1.200.000', note: 'Cambios acumulados', tone: 'violet' }]} /><section className="terminal-data-panel"><div className="panel-title-line"><h2>Publicaciones monitoreadas</h2><DemoLabel /></div><div className="terminal-data-table"><table><thead><tr><th>Vehículo</th><th>Origen</th><th>Precio inicial</th><th>Precio actual</th><th>Variación</th><th>Eventos</th><th>Último evento</th><th>Estado</th><th>Control</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{row.vehicle}</strong></td><td>{row.source}</td><td>{row.initial}</td><td>{row.current}</td><td className="positive-value">{row.change}</td><td>{row.events}</td><td>{row.lastEvent}</td><td><Status value={row.state} /></td><td><button className="table-icon-button" type="button" onClick={() => toggle(row.id)} aria-label={`${row.state === 'Activo' ? 'Pausar' : 'Activar'} ${row.vehicle}`}>{row.state === 'Activo' ? <Pause /> : <Play />}</button></td></tr>)}{!rows.length ? <EmptyRow columns={9} /> : null}</tbody></table></div></section>{showAdd ? <TerminalModal title="Nuevo seguimiento" onClose={() => setShowAdd(false)}><form className="terminal-modal-form" onSubmit={add}><DemoField label="Enlace de la publicación" value={url} onChange={setUrl} placeholder="https://…" inputMode="url" /><label className="terminal-checkbox"><input type="checkbox" defaultChecked /> Avisarme cuando cambie el precio</label><label className="terminal-checkbox"><input type="checkbox" defaultChecked /> Avisarme cuando se retire la publicación</label><button className="terminal-save-button" type="submit"><Link2 /> Comenzar seguimiento</button></form></TerminalModal> : null}</main>
}

function AlertsView({ query, store, updateStore, notify }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const rows = store.alerts.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  const toggle = (id) => updateStore((current) => ({ ...current, alerts: current.alerts.map((row) => row.id === id ? { ...row, enabled: !row.enabled } : row) }))
  const add = (event) => { event.preventDefault(); if (!name) return; updateStore((current) => ({ ...current, alerts: [...current.alerts, { id: `ale-${Date.now()}`, name, scope: 'Configuración personalizada', channel: 'Terminal', lastTriggered: 'Nunca', enabled: true }] })); setName(''); setShowAdd(false); notify('Regla de alerta creada') }
  return <main className="terminal-view"><ViewHeading title="Alertas" copy="Define reglas y prioriza eventos que requieren una decisión."><button className="primary" type="button" onClick={() => setShowAdd(true)}><Plus /> Crear alerta</button></ViewHeading><div className="alert-layout"><section className="terminal-data-panel"><div className="panel-title-line"><h2>Reglas de alerta</h2><DemoLabel /></div><div className="alert-rule-list">{rows.map((row) => <article key={row.id}><span className={`alert-rule-icon${row.enabled ? ' is-on' : ''}`}><Bell /></span><div><strong>{row.name}</strong><small>{row.scope} · {row.channel}</small></div><span className="last-triggered">Última activación<strong>{row.lastTriggered}</strong></span><button className={`toggle-switch${row.enabled ? ' is-on' : ''}`} type="button" onClick={() => toggle(row.id)} aria-label={`${row.enabled ? 'Desactivar' : 'Activar'} ${row.name}`}><span /></button></article>)}</div></section><aside className="alert-inbox"><h2>Eventos recientes</h2><article><AlertTriangle /><div><strong>Unidad sobre precio de mercado</strong><small>Vehículo C · Hace 2 h</small></div><ChevronRight /></article><article><TrendingDown /><div><strong>Cambio de precio detectado</strong><small>Vehículo A · Hace 5 h</small></div><ChevronRight /></article><article><Clock3 /><div><strong>Permanencia superior a 60 días</strong><small>Vehículo D · Ayer</small></div><ChevronRight /></article></aside></div>{showAdd ? <TerminalModal title="Crear regla de alerta" onClose={() => setShowAdd(false)}><form className="terminal-modal-form" onSubmit={add}><DemoField label="Nombre de la alerta" value={name} onChange={setName} placeholder="Describe qué quieres vigilar" /><InlineSelect label="Ámbito" /><InlineSelect label="Canal de aviso" /><button className="terminal-save-button" type="submit"><Bell /> Crear alerta</button></form></TerminalModal> : null}</main>
}

function DataView() {
  return <main className="terminal-view"><ViewHeading title="Datos y metodología" copy="Revisa procedencia, cobertura, calidad y limitaciones del conjunto."><Link className="view-link-button" to="/methodology"><ShieldCheck /> Ver metodología completa</Link></ViewHeading><section className="data-quality-overview"><div><h2>Preparación del conjunto</h2><p>La infraestructura está diseñada para conservar trazabilidad y permisos desde la observación original hasta cada resultado.</p><span className="quality-progress"><i style={{ width: '68%' }} /></span><small>Estado demostrativo · 68%</small></div><dl><div><dt>Fuentes registradas</dt><dd>3</dd></div><div><dt>Licencias confirmadas</dt><dd>1 de 3</dd></div><div><dt>Última actualización</dt><dd>Hace 6 h</dd></div><div><dt>Cobertura validada</dt><dd>Pendiente</dd></div></dl></section><section className="terminal-data-panel"><div className="panel-title-line"><h2>Registro de fuentes</h2><DemoLabel /></div><div className="terminal-data-table"><table><thead><tr><th>Fuente</th><th>Tipo</th><th>Base de uso</th><th>Actualización</th><th>Observaciones</th><th>Cobertura</th><th>Estado</th></tr></thead><tbody>{sourceRows.map((row) => <tr key={row.source}><td><strong>{row.source}</strong></td><td>{row.type}</td><td>{row.license}</td><td>{row.freshness}</td><td>{row.observations}</td><td>{row.coverage}</td><td><Status value={row.state} /></td></tr>)}</tbody></table></div></section><section className="governance-checks"><article><ShieldCheck /><div><strong>Procedencia y licencia</strong><p>Cada dato conserva fuente, permiso, fecha y política de retención.</p></div></article><article><ListChecks /><div><strong>Reproducibilidad</strong><p>Entradas, metodología y resultados deben quedar versionados.</p></div></article><article><Globe2 /><div><strong>Cobertura explícita</strong><p>Los resultados mostrarán zonas con datos suficientes y limitaciones.</p></div></article></section></main>
}

function InlineSelect({ label }) {
  return <label className="terminal-inline-select"><span>{label}</span><select aria-label={label} defaultValue="Todos"><option>Todos</option><option>Opción demostrativa</option></select><ChevronDown /></label>
}

function DemoField({ label, value, onChange, placeholder = '', type = 'text', inputMode }) {
  return <label className="terminal-form-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} /></label>
}

function Segmented({ value, onChange, options }) {
  return <div className="terminal-segmented">{options.map((option) => <button className={value === option ? 'is-active' : ''} key={option} type="button" onClick={() => onChange(option)}>{option}</button>)}</div>
}

function Status({ value }) {
  const slug = String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
  return <span className={`terminal-status status-${slug}`}>{value}</span>
}

function EmptyRow({ columns }) {
  return <tr><td className="empty-table" colSpan={columns}>No encontramos resultados para esta vista.</td></tr>
}

function exportRows(rows, filename, notify) {
  const headers = Object.keys(rows[0])
  const content = [headers.join(','), ...rows.map((row) => headers.map((header) => `"${String(row[header]).replaceAll('"', '""')}"`).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
  notify('CSV demostrativo exportado')
}
