// Una fecha dibujada como hoja de taco de calendario: mes arriba, día grande, día de la semana.
import { useFormato } from '../context/Preferencias.jsx'
import { aFecha } from '../utilidades/formato.js'
import './FechaTaco.css'

export default function FechaTaco({ fecha, pequeno = false }) {
  const { mesCorto, semanaCorta, fechaLarga } = useFormato()

  return (
    <time className={`taco ${pequeno ? 'taco--pequeno' : ''}`} dateTime={fecha} title={fechaLarga(fecha)}>
      <span className="taco-mes">{mesCorto(fecha)}</span>
      <span className="taco-dia">{aFecha(fecha).getDate()}</span>
      <span className="taco-semana">{semanaCorta(fecha)}</span>
    </time>
  )
}
