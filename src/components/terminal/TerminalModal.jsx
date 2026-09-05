import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function TerminalModal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="terminal-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`terminal-modal${wide ? ' terminal-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="terminal-modal-title">
        <header><h2 id="terminal-modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
        {children}
      </section>
    </div>
  )
}
