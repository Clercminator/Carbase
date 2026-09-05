export default function MarketChart() {
  return (
    <svg className="market-chart" viewBox="0 0 760 250" role="img" aria-label="Evolución demostrativa del precio mediano y las publicaciones activas">
      <defs><linearGradient id="terminal-market-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07958a" stopOpacity=".22" /><stop offset="1" stopColor="#07958a" stopOpacity="0" /></linearGradient></defs>
      {[36, 86, 136, 186].map((y) => <line key={y} className="market-chart-grid" x1="42" y1={y} x2="738" y2={y} />)}
      <path className="market-chart-area" d="M42 155 C74 143 92 128 120 137 S169 151 200 129 S248 116 280 134 S334 172 370 151 S421 127 458 143 S508 155 546 134 S596 146 631 126 S690 145 738 118 L738 210 L42 210 Z" />
      <path className="market-chart-line" d="M42 155 C74 143 92 128 120 137 S169 151 200 129 S248 116 280 134 S334 172 370 151 S421 127 458 143 S508 155 546 134 S596 146 631 126 S690 145 738 118" />
      <path className="market-chart-dashed" d="M42 88 C88 88 92 70 130 78 S206 92 252 76 S340 84 390 70 S468 73 520 82 S612 68 738 79" />
      {['22 Abr', '29 Abr', '6 May', '13 May', '20 May'].map((label, index) => <text key={label} x={58 + index * 157} y="235">{label}</text>)}
    </svg>
  )
}
