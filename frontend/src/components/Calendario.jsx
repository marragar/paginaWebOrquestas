// Calendario mensual con el estado de cada día.
//   dias:            { 'AAAA-MM-DD': { estado: 'libre' | 'reservada' | 'bloqueada', ... } }
//   seleccionadas:   fechas marcadas por el usuario
//   esSeleccionable: (fecha, info) => bool  — qué días se pueden pulsar
//   onDia:           (fecha, info) => void
import { useState } from 'react'
import { useFormato, useTextos } from '../context/Preferencias.jsx'
import { aTexto } from '../utilidades/formato.js'
import './Calendario.css'

function primerDiaDelMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1, 12)
}

export default function Calendario({
  dias = {},
  seleccionadas = [],
  esSeleccionable = () => false,
  onDia = () => {},
  mesInicial,
}) {
  const [mes, setMes] = useState(() =>
    primerDiaDelMes(mesInicial ? new Date(`${mesInicial}-01T12:00:00`) : new Date()),
  )
  const { t } = useTextos()
  const { mesYAnio, diaSemanaLargo } = useFormato()
  const hoy = aTexto(new Date())

  const titulo = mesYAnio(mes)
  // Nombres largos de lunes a domingo en el idioma elegido (5 de enero de 2026 fue lunes)
  const semanaLarga = Array.from({ length: 7 }, (_, i) => diaSemanaLargo(new Date(2026, 0, 5 + i, 12)))
  const iniciales = t('calendario.iniciales')
  const huecos = (mes.getDay() + 6) % 7 // lunes = 0
  const totalDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()

  function moverMes(delta) {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1, 12))
  }

  const celdas = []
  for (let i = 0; i < huecos; i++) celdas.push(<div key={`h${i}`} className="cal-hueco" />)

  for (let d = 1; d <= totalDias; d++) {
    const fecha = aTexto(new Date(mes.getFullYear(), mes.getMonth(), d, 12))
    const info = dias[fecha]
    const pasado = fecha < hoy
    const pulsable = !pasado && esSeleccionable(fecha, info)
    const seleccionada = seleccionadas.includes(fecha)

    const clases = [
      'cal-dia',
      info ? `cal-dia--${info.estado}` : 'cal-dia--vacio',
      pasado ? 'cal-dia--pasado' : '',
      fecha === hoy ? 'cal-dia--hoy' : '',
      seleccionada ? 'cal-dia--seleccionada' : '',
    ].join(' ')

    const diaSemana = semanaLarga[(huecos + d - 1) % 7]
    const etiqueta = [
      `${diaSemana} ${d}`,
      info && t(`estado.${info.estado}`),
      seleccionada && t('calendario.seleccionado'),
    ]
      .filter(Boolean)
      .join(', ')

    celdas.push(
      <button
        key={fecha}
        type="button"
        className={clases}
        disabled={!pulsable}
        aria-pressed={pulsable ? seleccionada : undefined}
        aria-label={etiqueta}
        onClick={() => onDia(fecha, info)}
      >
        <span className="cal-numero">{d}</span>
      </button>,
    )
  }

  return (
    <div className="calendario">
      <div className="cal-cabecera">
        <button type="button" className="boton boton--discreto" onClick={() => moverMes(-1)} aria-label={t('calendario.anterior')}>
          ‹
        </button>
        <h3 className="cal-titulo">{titulo}</h3>
        <button type="button" className="boton boton--discreto" onClick={() => moverMes(1)} aria-label={t('calendario.siguiente')}>
          ›
        </button>
      </div>

      <div className="cal-rejilla">
        {iniciales.map((s, i) => (
          <abbr key={i} className="cal-semana" title={semanaLarga[i]}>
            {s}
          </abbr>
        ))}
        {celdas}
      </div>

      <ul className="cal-leyenda">
        <li><span className="muestra muestra--libre" />{t('estado.libre')}</li>
        <li><span className="muestra muestra--reservada" />{t('estado.reservada')}</li>
        <li><span className="muestra muestra--bloqueada" />{t('estado.bloqueada')}</li>
      </ul>
    </div>
  )
}
