import { useId, useMemo, useRef, useState } from 'react'
import { ArrowRight, CarFront, ChevronDown, Link2, LockKeyhole, Search, SquareDashed } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { saveDemoAnalysis } from '../lib/demoAnalysis.js'

const methods = [
  { id: 'link', label: 'Pegar publicación', Icon: Link2 },
  { id: 'plate', label: 'Ingresar patente', Icon: SquareDashed },
  { id: 'filters', label: 'Describir vehículo', Icon: CarFront },
]

const initialFilters = { condition: 'Usado', type: 'Automóvil', brand: '', model: '', version: '', year: '', mileage: '', region: '' }

export default function DealCheckForm({ compact = false, initialMethod = 'link', onComplete }) {
  const [method, setMethod] = useState(initialMethod)
  const [link, setLink] = useState('')
  const [plate, setPlate] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [plateConsent, setPlateConsent] = useState(false)
  const tabsRef = useRef([])
  const instanceId = useId()
  const navigate = useNavigate()

  const normalizedPlate = useMemo(() => plate.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6), [plate])

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  const submit = (event) => {
    event.preventDefault()
    setError('')

    if (method === 'link') {
      try {
        const parsed = new URL(link)
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid')
      } catch {
        setError('Ingresa un enlace válido que comience con http:// o https://')
        return
      }
    }
    if (method === 'plate' && normalizedPlate.length < 5) {
      setError('Ingresa una patente válida para continuar.')
      return
    }
    if (method === 'plate' && !plateConsent) {
      setError('Confirma el tratamiento de la patente para continuar.')
      return
    }
    if (method === 'filters' && (!filters.brand || !filters.model || !filters.region)) {
      setError('Completa marca, modelo y región para continuar.')
      return
    }

    const input = method === 'link'
      ? { method, publicationUrl: link.trim() }
      : method === 'plate'
        ? { method, plate: normalizedPlate }
        : { method, ...filters }

    setSubmitting(true)
    const analysis = saveDemoAnalysis(input)
    window.setTimeout(() => {
      setSubmitting(false)
      if (onComplete) onComplete(analysis)
      else navigate(`/analysis/${analysis.analysisId}`, { state: { processing: true } })
    }, 550)
  }

  const handleTabKey = (event, index) => {
    const last = methods.length - 1
    let next = index
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return
    event.preventDefault()
    setMethod(methods[next].id)
    setError('')
    tabsRef.current[next]?.focus()
  }

  return (
    <form className={`deal-check-form${compact ? ' deal-check-form--compact' : ''}`} onSubmit={submit} noValidate>
      <div className="deal-methods" role="tablist" aria-label="Forma de ingresar el vehículo">
        {methods.map(({ id, label, Icon }, index) => (
          <button
            className={method === id ? 'is-active' : ''}
            key={id}
            type="button"
            role="tab"
            aria-label={label}
            aria-selected={method === id}
            aria-controls={`${instanceId}-panel-${id}`}
            id={`${instanceId}-tab-${id}`}
            tabIndex={method === id ? 0 : -1}
            ref={(node) => { tabsRef.current[index] = node }}
            onKeyDown={(event) => handleTabKey(event, index)}
            onClick={() => { setMethod(id); setError('') }}
          >
            <Icon aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="deal-form-body" role="tabpanel" id={`${instanceId}-panel-${method}`} aria-labelledby={`${instanceId}-tab-${method}`}>
        {method === 'link' ? (
          <label className="deal-primary-input">
            <span className="sr-only">Enlace de la publicación</span>
            <Link2 aria-hidden="true" />
            <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Pega el enlace de la publicación" inputMode="url" autoComplete="url" aria-invalid={Boolean(error)} aria-describedby={`${instanceId}-error`} />
          </label>
        ) : null}

        {method === 'plate' ? (
          <label className="deal-primary-input plate-input">
            <span className="sr-only">Patente del vehículo</span>
            <SquareDashed aria-hidden="true" />
            <input value={normalizedPlate} onChange={(event) => setPlate(event.target.value)} placeholder="Ingresa la patente" autoCapitalize="characters" autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={`${instanceId}-plate-note ${instanceId}-error`} />
          </label>
        ) : null}

        {method === 'filters' ? (
          <div className="vehicle-filter-grid">
            <FilterSelect label="Estado" value={filters.condition} onChange={(value) => updateFilter('condition', value)} options={['Usado', 'Nuevo']} />
            <FilterSelect label="Tipo" value={filters.type} onChange={(value) => updateFilter('type', value)} options={['Automóvil', 'SUV', 'Camioneta', 'Comercial']} />
            <FilterSelect label="Marca" value={filters.brand} onChange={(value) => updateFilter('brand', value)} options={['', 'Marca seleccionada']} placeholder="Seleccionar" />
            <FilterSelect label="Modelo" value={filters.model} onChange={(value) => updateFilter('model', value)} options={['', 'Modelo seleccionado']} placeholder="Seleccionar" disabled={!filters.brand} />
            <label className="deal-field"><span>Versión</span><input value={filters.version} onChange={(event) => updateFilter('version', event.target.value)} placeholder="Versión o configuración" /></label>
            <label className="deal-field"><span>Año</span><input value={filters.year} onChange={(event) => updateFilter('year', event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="AAAA" inputMode="numeric" /></label>
            <label className="deal-field"><span>Kilometraje</span><input value={filters.mileage} onChange={(event) => updateFilter('mileage', event.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="Kilómetros" inputMode="numeric" /></label>
            <FilterSelect label="Región" value={filters.region} onChange={(value) => updateFilter('region', value)} options={['', 'Región Metropolitana', 'Zona norte', 'Zona centro', 'Zona sur']} placeholder="Seleccionar" />
          </div>
        ) : null}

        <button className="deal-submit" type="submit" disabled={submitting}>
          {submitting ? <><Search className="spin" aria-hidden="true" /> Preparando análisis…</> : <>Analizar gratis <ArrowRight aria-hidden="true" /></>}
        </button>
        <p className="deal-privacy"><LockKeyhole aria-hidden="true" /> No necesitas crear una cuenta · <Link to="/privacy">Cómo cuidamos tus datos</Link></p>
        <p id={`${instanceId}-error`} className={`deal-error${error ? ' is-visible' : ''}`} role="alert">{error || ' '}</p>
        {method === 'plate' ? <div className="plate-consent" id={`${instanceId}-plate-note`}><label><input type="checkbox" checked={plateConsent} onChange={(event) => setPlateConsent(event.target.checked)} /> <span>Autorizo el uso temporal de la patente para identificar el vehículo y generar este análisis.</span></label><Link to="/privacy#patentes">Finalidad y retención</Link></div> : null}
      </div>
    </form>
  )
}

function FilterSelect({ label, value, onChange, options, placeholder, disabled = false }) {
  return (
    <label className={`deal-field${disabled ? ' is-disabled' : ''}`}>
      <span>{label}</span>
      <span className="deal-select">
        <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
          {options.map((option) => <option key={option || 'empty'} value={option}>{option || placeholder}</option>)}
        </select>
        <ChevronDown aria-hidden="true" />
      </span>
    </label>
  )
}
