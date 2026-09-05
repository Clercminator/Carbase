import { useEffect } from 'react'

const DEFAULT_DESCRIPTION = 'Inteligencia de mercado para autos usados en Chile: precios, comparables, demanda y rotación.'

export default function PageMeta({ title, description = DEFAULT_DESCRIPTION }) {
  useEffect(() => {
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    const previous = meta?.getAttribute('content')
    meta?.setAttribute('content', description)
    return () => {
      if (previous) meta?.setAttribute('content', previous)
    }
  }, [description, title])

  return null
}
