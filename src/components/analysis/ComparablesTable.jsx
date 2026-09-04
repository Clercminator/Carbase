import { comparables } from '../../data/sampleData.js'

export default function ComparablesTable() {
  return (
    <section className="comparables" id="comparables">
      <div className="comparables-heading">
        <h2>Comparables en el mercado</h2>
        <span>Datos de muestra</span>
      </div>
      <div className="table-shell">
        <table>
          <thead><tr><th>Versión</th><th>Año</th><th>Kilometraje</th><th>Región</th><th>Precio</th><th>Días publicado</th></tr></thead>
          <tbody>
            {comparables.map((row) => (
              <tr key={row.version}>
                <td>{row.version}</td><td>{row.year}</td><td>{row.mileage}</td><td>{row.region}</td><td>{row.price}</td><td>{row.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
