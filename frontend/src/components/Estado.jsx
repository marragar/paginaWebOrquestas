// Etiqueta de color para el estado de una reserva, de un día o de una orquesta.
// `texto` permite cambiar la palabra según quién la lee (p. ej. "Sin responder" para la orquesta).
import { useTextos } from '../context/Preferencias.jsx'
import './Estado.css'

export default function Estado({ estado, texto }) {
  const { t } = useTextos()
  return <span className={`estado estado--${estado}`}>{texto ?? t(`estado.${estado}`)}</span>
}
