import { useState } from 'react'
import { Link } from 'react-router-dom'
import Estado from '../../components/Estado.jsx'
import FechaTaco from '../../components/FechaTaco.jsx'
import { IconoTelefono, enlaceTelefono } from '../../components/Iconos.jsx'
import { useFormato, useTextos } from '../../context/Preferencias.jsx'
import { useSesion } from '../../context/SesionDemo.jsx'
import { precioDe, reservaCompleta, reservas as todas } from '../../datos/demo.js'
import './MisReservas.css'

const FILTROS = ['todas', 'pendiente', 'aceptada', 'rechazada', 'cancelada']

export default function MisReservas() {
  const { t } = useTextos()
  const { euros, fechaCorta } = useFormato()
  const { cuenta } = useSesion()
  const [reservas, setReservas] = useState(() =>
    todas
      .filter((r) => r.usuario_id === cuenta?.id)
      .map(reservaCompleta)
      .sort((a, b) => a.disponibilidad.fecha.localeCompare(b.disponibilidad.fecha)),
  )
  const [filtro, setFiltro] = useState('todas')
  const [confirmando, setConfirmando] = useState(null)

  const visibles = reservas.filter((r) => filtro === 'todas' || r.estado === filtro)

  function cancelar(id) {
    // TODO: POST /reservas/{id}/cancelar
    setReservas(reservas.map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r)))
    setConfirmando(null)
  }

  return (
    <div className="contenedor pagina">
      <div className="pagina-cabecera">
        <div>
          <h1>{t('reservas.titulo')}</h1>
          <p>{t('reservas.subtitulo')}</p>
        </div>
        <Link to="/orquestas" className="boton">{t('reservas.pedirOtro')}</Link>
      </div>

      <div className="filtros" role="group" aria-label={t('reservas.filtrar')}>
        {FILTROS.map((valor) => {
          const n = valor === 'todas' ? reservas.length : reservas.filter((r) => r.estado === valor).length
          return (
            <button
              key={valor}
              type="button"
              className="filtro"
              aria-pressed={filtro === valor}
              onClick={() => setFiltro(valor)}
            >
              {valor === 'todas' ? t('reservas.todas') : t(`reservas.filtro.${valor}`)}
              <span className="cuenta">{n}</span>
            </button>
          )
        })}
      </div>

      {visibles.length === 0 ? (
        <div className="vacio">
          <p>{reservas.length === 0 ? t('reservas.vacioNinguna') : t('reservas.vacioEstado')}</p>
          <Link to="/orquestas" className="boton boton--secundario">{t('nav.buscar')}</Link>
        </div>
      ) : (
        <ul className="reservas">
          {visibles.map((r) => (
            <li key={r.id} className={`reserva reserva--${r.estado}`}>
              <FechaTaco fecha={r.disponibilidad.fecha} />

              <div className="reserva-cuerpo">
                <div className="reserva-titulo">
                  <h2>
                    <Link to={`/orquestas/${r.orquesta.id}`}>{r.orquesta.nombre}</Link>
                  </h2>
                  <Estado estado={r.estado} />
                </div>
                <dl className="datos">
                  <div><dt>{t('campos.lugar')}</dt><dd>{r.lugar || t('comun.sinIndicar')}</dd></div>
                  <div><dt>{t('campos.hora')}</dt><dd>{r.hora_inicio || t('comun.sinIndicar')}</dd></div>
                  <div><dt>{t('campos.precio')}</dt><dd>{euros(precioDe(r.disponibilidad, r.orquesta))}</dd></div>
                </dl>
                {r.mensaje && <p className="reserva-mensaje">{r.mensaje}</p>}
                <p className="reserva-pie">{t('reservas.pedidaEl', { fecha: fechaCorta(r.creado_en) })}</p>
              </div>

              <div className="reserva-acciones">
                {confirmando === r.id ? (
                  <div className="confirmar" role="alert">
                    <p>
                      {r.estado === 'aceptada' ? t('reservas.confirmarAceptada') : t('reservas.confirmarPendiente')}
                    </p>
                    <div className="acciones">
                      <button type="button" className="boton boton--pequeno" onClick={() => cancelar(r.id)}>
                        {t('reservas.siCancelar')}
                      </button>
                      <button
                        type="button"
                        className="boton boton--secundario boton--pequeno"
                        onClick={() => setConfirmando(null)}
                      >
                        {t('reservas.no')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <a href={enlaceTelefono(r.orquesta.telefono)} className="boton boton--secundario boton--pequeno">
                      <IconoTelefono />
                      {t('comun.llamar')}
                    </a>
                    {(r.estado === 'pendiente' || r.estado === 'aceptada') && (
                      <button
                        type="button"
                        className="boton boton--discreto boton--pequeno"
                        onClick={() => setConfirmando(r.id)}
                      >
                        {t('reservas.cancelar')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
