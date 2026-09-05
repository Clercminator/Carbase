import { Bell, Bookmark, CarFront, SearchCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import TerminalModal from '../terminal/TerminalModal.jsx'

const SAVED_KEY = 'autoindex.saved-analyses.v1'

export default function AnalysisNextActions({ analysisId, scenario }) {
  const [saved, setSaved] = useState(false)
  const [showInspection, setShowInspection] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [consent, setConsent] = useState(false)

  const save = () => {
    try {
      const current = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
      const safeRecord = { analysisId, scenarioId: scenario.id, savedAt: new Date().toISOString() }
      localStorage.setItem(SAVED_KEY, JSON.stringify([safeRecord, ...current.filter((item) => item.analysisId !== analysisId)]))
    } catch { /* the confirmation remains useful when storage is unavailable */ }
    setSaved(true)
  }

  const requestInspection = (event) => {
    event.preventDefault()
    if (!consent) return
    setSubmitted(true)
  }

  return (
    <section className="analysis-next-actions" aria-labelledby="next-action-title">
      <div><h2 id="next-action-title">Convierte el análisis en una decisión</h2><p>Guárdalo, monitorea la publicación o prepara la verificación del vehículo.</p></div>
      <div className="next-action-buttons">
        <button className="next-action-primary" type="button" onClick={() => setShowInspection(true)}><SearchCheck /> Solicitar inspección</button>
        <button type="button" onClick={save}><Bookmark /> {saved ? 'Análisis guardado' : 'Guardar análisis'}</button>
        <Link to="/terminal/seguimientos"><Bell /> Seguir precio</Link>
        <Link to="/deal-check"><CarFront /> Comparar otro vehículo</Link>
      </div>
      {showInspection ? <TerminalModal title="Preparar solicitud de inspección" onClose={() => { setShowInspection(false); setSubmitted(false) }}>
        {submitted ? <div className="inspection-success" role="status"><SearchCheck /><h3>Solicitud demostrativa preparada</h3><p>No enviamos ni almacenamos información. La conexión con inspectores se habilitará cuando exista un servicio autorizado.</p><button type="button" onClick={() => setShowInspection(false)}>Entendido</button></div> : <form className="terminal-modal-form" onSubmit={requestInspection}>
          <label className="terminal-form-field"><span>Región de inspección</span><select required defaultValue=""><option value="" disabled>Seleccionar</option><option>Región Metropolitana</option><option>Zona norte</option><option>Zona centro</option><option>Zona sur</option></select></label>
          <label className="terminal-form-field"><span>Correo de contacto</span><input type="email" required autoComplete="email" placeholder="nombre@correo.cl" /></label>
          <label className="terminal-checkbox"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /> Autorizo el contacto únicamente para coordinar esta solicitud. Ningún dato se envía en esta demostración.</label>
          <Link className="modal-privacy-link" to="/privacy#contacto">Revisar tratamiento de datos</Link>
          <button className="terminal-save-button" type="submit"><SearchCheck /> Preparar solicitud</button>
        </form>}
      </TerminalModal> : null}
    </section>
  )
}
