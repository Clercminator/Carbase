const cars = [
  [7, 18, 12, -8, .24], [15, 51, 10, 7, .18], [24, 29, 14, -3, .2], [33, 65, 11, 9, .22],
  [42, 18, 9, -10, .16], [49, 47, 13, 5, .19], [57, 29, 11, -5, .23], [64, 61, 15, 8, .17],
  [72, 16, 10, -7, .21], [79, 43, 13, 4, .18], [88, 27, 11, -4, .22], [94, 58, 14, 6, .16],
  [11, 76, 13, 5, .14], [28, 83, 10, -6, .15], [53, 79, 12, 4, .16], [76, 81, 9, -5, .14],
]

export default function HeroCarField() {
  return (
    <div className="hero-car-field" aria-hidden="true">
      {cars.map(([left, top, size, rotation, opacity], index) => (
        <span key={`${left}-${top}`} style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}px`, opacity, '--rotation': `${rotation}deg`, '--delay': `${index * -0.37}s` }}>🚗</span>
      ))}
    </div>
  )
}
