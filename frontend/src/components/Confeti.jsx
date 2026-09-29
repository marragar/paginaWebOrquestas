// Papelillos que caen despacio por el fondo de la portada.
// Las posiciones salen de una secuencia fija para que no cambien en cada render.
import './Confeti.css'

const COLORES = ['var(--rojo)', 'var(--amarillo)', 'var(--verde)', 'var(--blanco)']

// Pseudoaleatorio determinista entre 0 y 1
function azar(n) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const PAPELILLOS = Array.from({ length: 28 }, (_, i) => ({
  izquierda: `${azar(i) * 100}%`,
  retraso: `${azar(i + 100) * -14}s`, // negativo: ya están cayendo al cargar
  duracion: `${9 + azar(i + 200) * 8}s`,
  deriva: `${(azar(i + 300) - 0.5) * 120}px`,
  giro: `${360 + azar(i + 400) * 720}deg`,
  tamano: 5 + Math.round(azar(i + 500) * 5),
  color: COLORES[i % COLORES.length],
  redondo: i % 3 === 0,
}))

export default function Confeti() {
  return (
    <div className="confeti" aria-hidden="true">
      {PAPELILLOS.map((p, i) => (
        <span
          key={i}
          className={`papelillo ${p.redondo ? 'papelillo--redondo' : ''}`}
          style={{
            left: p.izquierda,
            width: p.tamano,
            height: p.redondo ? p.tamano : p.tamano * 1.8,
            background: p.color,
            animationDelay: p.retraso,
            animationDuration: p.duracion,
            '--deriva': p.deriva,
            '--giro': p.giro,
          }}
        />
      ))}
    </div>
  )
}
