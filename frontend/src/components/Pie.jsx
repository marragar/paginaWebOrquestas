import { useNavigate } from 'react-router-dom'
import { useTextos } from '../context/Preferencias.jsx'
import { useSesion } from '../context/SesionDemo.jsx'
import './Pie.css'

// A dónde lleva cada vista al cambiarla desde el selector de maqueta
const INICIO_DE = {
  visitante: '/',
  usuario: '/mis-reservas',
  orquesta: '/mi-orquesta/calendario',
  admin: '/admin',
}

const VISTAS = ['visitante', 'usuario', 'orquesta', 'admin']

export default function Pie() {
  const { t } = useTextos()
  const { rol, setRol } = useSesion()
  const navigate = useNavigate()

  function cambiar(nuevo) {
    setRol(nuevo)
    navigate(INICIO_DE[nuevo])
  }

  return (
    <footer className="pie">
      <div className="contenedor pie-fila">
        <p className="pie-texto">{t('pie.texto')}</p>

        {/* TEMPORAL: selector para revisar cada zona mientras no hay login real */}
        <div className="pie-maqueta" role="group" aria-label={t('pie.maqueta')}>
          <span>{t('pie.maqueta')}</span>
          {VISTAS.map((valor) => (
            <button
              key={valor}
              type="button"
              className="filtro"
              aria-pressed={rol === valor}
              onClick={() => cambiar(valor)}
            >
              {t(`pie.${valor}`)}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
