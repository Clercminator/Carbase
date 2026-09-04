import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { quickActions } from '../data/sampleData.js'

const secondaryFilters = [
  ['category', 'Categoría vehículo', ['Todas', 'Categoría seleccionada']],
  ['region', 'Región', ['Todas', 'Zona central', 'Otra región']],
  ['minPrice', 'Precio min', ['Sin mínimo', '$5.000.000', '$10.000.000']],
  ['maxPrice', 'Precio max', ['Sin máximo', '$20.000.000', '$30.000.000']],
  ['minYear', 'Año min', ['Sin mínimo', 'Rango reciente', 'Rango anterior']],
  ['maxYear', 'Año max', ['Sin máximo', 'Rango reciente', 'Rango anterior']],
]

export default function SearchExperience() {
  const [activeAction, setActiveAction] = useState(0)
  const [brand, setBrand] = useState('Todas las marcas')
  const [model, setModel] = useState('Todos los modelos')
  const [keyword, setKeyword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const keywordRef = useRef(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const submitAnalysis = (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    timerRef.current = setTimeout(() => {
      navigate('/analysis', {
        state: {
          vehicle: keyword.trim() || 'Vehículo seleccionado',
          version: model === 'Todos los modelos' ? 'Versión' : model,
        },
      })
    }, 450)
  }

  const changeBrand = (event) => {
    const nextBrand = event.target.value
    setBrand(nextBrand)
    setModel('Todos los modelos')
  }

  return (
    <section className="search-section" id="search">
      <div className="content-container">
        <h2 className="quick-heading">¿Qué harás hoy?</h2>
        <div className="quick-actions" role="list" aria-label="Acciones rápidas">
          {quickActions.map(({ label, Icon }, index) => (
            <button
              className={`quick-action${index === activeAction ? ' is-active' : ''}`}
              key={label}
              type="button"
              role="listitem"
              onClick={() => setActiveAction(index)}
            >
              <span className="quick-action-icon"><Icon aria-hidden="true" /></span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form className="search-card" onSubmit={submitAnalysis}>
          <div className="search-card-heading">
            <h2>Encuentra tu próximo vehículo</h2>
            <button className="smart-search" type="button" onClick={() => keywordRef.current?.focus()}>
              <Sparkles aria-hidden="true" />
              <span>Búsqueda inteligente</span>
              <span className="beta-chip">BETA</span>
              <Search aria-hidden="true" />
            </button>
          </div>

          <div className="primary-filters">
            <label className="form-field">
              <span>Tipo</span>
              <span className="select-control">
                <select defaultValue="Nuevo / usado"><option>Nuevo / usado</option><option>Usado</option><option>Nuevo</option></select>
                <ChevronDown aria-hidden="true" />
              </span>
            </label>
            <label className="form-field">
              <span>Marca</span>
              <span className="select-control">
                <select value={brand} onChange={changeBrand}><option>Todas las marcas</option><option>Marca seleccionada</option></select>
                <ChevronDown aria-hidden="true" />
              </span>
            </label>
            <label className={`form-field${brand === 'Todas las marcas' ? ' is-disabled' : ''}`}>
              <span>Modelo</span>
              <span className="select-control">
                <select value={model} onChange={(event) => setModel(event.target.value)} disabled={brand === 'Todas las marcas'}><option>Todos los modelos</option><option>Configuración seleccionada</option></select>
                <ChevronDown aria-hidden="true" />
              </span>
            </label>
            <label className="form-field">
              <span>Palabra clave</span>
              <input ref={keywordRef} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Escribe palabra clave" />
            </label>
            <button className="analyze-button" type="submit" disabled={submitting}>
              {submitting ? 'Analizando…' : 'Analizar mercado'}
            </button>
          </div>

          <div className="secondary-filters">
            {secondaryFilters.map(([name, label, options]) => (
              <label className="inline-select" key={name}>
                <span className="sr-only">{label}</span>
                <select name={name} defaultValue={options[0]} aria-label={label}>
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
                <span className="inline-select-label" aria-hidden="true">{label}</span>
                <ChevronDown aria-hidden="true" />
              </label>
            ))}
          </div>
        </form>
      </div>
    </section>
  )
}
