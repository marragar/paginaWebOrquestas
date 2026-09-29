// Guirnalda de banderines de fiesta, dibujada en SVG.
// Varias "caídas" de cuerda; en cada una, banderines triangulares que siguen la curva
// y bombillas entre ellos. Al cargar, los banderines caen uno a uno y luego se balancean.
import './Banderines.css'

const COLORES = ['var(--rojo)', 'var(--amarillo)', 'var(--verde)', 'var(--blanco)']
const ANCHO = 1440
const CAIDAS = 4
const BANDERINES_POR_CAIDA = 9
const COMBA = 26

function alturaCuerda(x) {
  const tramo = ANCHO / CAIDAS
  const t = (x % tramo) / tramo // 0..1 dentro de cada caída
  return 4 + COMBA * 4 * t * (1 - t)
}

export default function Banderines({ className = '' }) {
  const tramo = ANCHO / CAIDAS
  const paso = tramo / (BANDERINES_POR_CAIDA + 1)
  const banderines = []
  const bombillas = []

  for (let c = 0; c < CAIDAS; c++) {
    for (let b = 1; b <= BANDERINES_POR_CAIDA; b++) {
      const x = c * tramo + b * paso
      const y = alturaCuerda(x)
      const i = c * BANDERINES_POR_CAIDA + b
      banderines.push(
        <polygon
          key={i}
          className="banderin"
          style={{
            '--i': i,
            '--balanceo': `${2.6 + (i % 5) * 0.35}s`,
          }}
          points={`${x - 17},${y} ${x + 17},${y} ${x},${y + 38}`}
          fill={COLORES[i % COLORES.length]}
        />,
      )

      // Una bombilla entre cada par de banderines
      if (b < BANDERINES_POR_CAIDA) {
        const xb = x + paso / 2
        bombillas.push(
          <circle
            key={`b${i}`}
            className="bombilla"
            style={{ '--i': i, '--parpadeo': `${1.8 + ((i * 7) % 11) / 5}s` }}
            cx={xb}
            cy={alturaCuerda(xb) + 5}
            r="3.2"
          />,
        )
      }
    }
  }

  let cuerda = `M0 ${alturaCuerda(0)}`
  for (let x = 8; x <= ANCHO; x += 8) cuerda += ` L${x} ${alturaCuerda(x - 0.001)}`

  return (
    <svg
      className={`banderines ${className}`}
      viewBox={`0 0 ${ANCHO} 72`}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="brillo" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" result="difuso" />
          <feMerge>
            <feMergeNode in="difuso" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path className="cuerda" d={cuerda} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      {banderines}
      <g filter="url(#brillo)">{bombillas}</g>
    </svg>
  )
}
