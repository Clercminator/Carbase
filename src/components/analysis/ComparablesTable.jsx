export default function ComparablesTable({ scenario }) {
  return (
    <section className="comparables" id="comparables">
      <div className="comparables-heading">
        <h2>Comparables en el mercado</h2>
        <span>{scenario.confidence.sampleSize} observaciones · datos demostrativos</span>
      </div>
      <div className="table-shell" role="region" aria-label="Tabla de comparables; desplázate horizontalmente para ver todas las columnas" tabIndex="0">
        <table>
          <thead><tr><th>Versión</th><th>Kilometraje</th><th>Región</th><th>Precio publicado</th><th>Actualización</th><th>Similitud</th><th>Incluido</th></tr></thead>
          <tbody>
            {scenario.comparables.map((row) => (
              <tr key={row.version}>
                <td>{row.version}</td><td>{row.mileage}</td><td>{row.region}</td><td>{row.price}</td><td>{row.updated}</td><td><span className="similarity"><i style={{ width: `${row.similarity}%` }} />{row.similarity}%</span></td><td><span className={`included-dot${row.included ? ' is-included' : ''}`}>{row.included ? 'Sí' : 'No'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
