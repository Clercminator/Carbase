export default function PriceChart() {
  return (
    <svg className="price-chart" viewBox="0 0 720 340" role="img" aria-label="Evolución estimada del precio de mercado entre enero y junio">
      <defs>
        <linearGradient id="market-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#18aa9c" stopOpacity=".32" />
          <stop offset="1" stopColor="#18aa9c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[42, 106, 170, 234].map((y) => <line className="chart-grid" key={y} x1="48" y1={y} x2="700" y2={y} />)}
      <line className="chart-axis" x1="48" y1="298" x2="700" y2="298" />
      {[
        ['20M', 46], ['19M', 110], ['18M', 174], ['17M', 238], ['16M', 302],
      ].map(([label, y]) => <text key={label} x="7" y={y}>{label}</text>)}
      <path className="chart-area" d="M48 270 C70 225 82 218 98 156 S135 65 160 92 S195 150 220 104 S260 53 286 112 S320 188 350 169 S386 205 408 176 S445 188 470 185 S505 220 530 258 S562 220 586 205 S620 217 646 190 S676 206 700 170 L700 298 L48 298 Z" />
      <path className="chart-line" d="M48 270 C70 225 82 218 98 156 S135 65 160 92 S195 150 220 104 S260 53 286 112 S320 188 350 169 S386 205 408 176 S445 188 470 185 S505 220 530 258 S562 220 586 205 S620 217 646 190 S676 206 700 170" />
      <circle cx="48" cy="270" r="4" fill="white" stroke="#0b958b" strokeWidth="3" />
      <circle cx="700" cy="170" r="4" fill="white" stroke="#0b958b" strokeWidth="3" />
      {[
        ['Ene', 48], ['Feb', 176], ['Mar', 304], ['Abr', 432], ['May', 560], ['Jun', 680],
      ].map(([label, x]) => <text key={label} x={x} y="325">{label}</text>)}
    </svg>
  )
}
