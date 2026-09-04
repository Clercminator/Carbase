import { Play } from 'lucide-react'

export default function VideoPlaceholder() {
  return (
    <div className="video-frame" aria-label="Espacio reservado para el video del producto">
      <div className="video-surface">
        <span className="play-button" aria-hidden="true"><Play /></span>
        <span className="video-caption">Video del producto</span>
      </div>
    </div>
  )
}
