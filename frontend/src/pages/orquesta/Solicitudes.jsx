// Solicitudes agrupadas por día: varios pueblos pueden pedir la misma fecha
// y aceptar una rechaza automáticamente las demás (SPEC §4.4).
import { useState } from 'react'
import Estado from '../../components/Estado.jsx'
import FechaTaco from '../../components/FechaTaco.jsx'
import { IconoTelefono, enlaceTelefono } from '../../components/Iconos.jsx'
import { useFormato, useTextos } from '../../context/Preferencias.jsx'
import { useSesion } from '../../context/SesionDemo.jsx'
import { reservaCompleta, reservas as todas } from '../../datos/demo.js'
import '../usuario/MisReservas.css'
import './Solicitudes.css'

export default function Solicitudes() {
  const { t } = useTextos()
  const { fechaCorta, fechaLarga } = useFormato()
  const { cuenta } = useSesion()
  const [reservas, setReservas] = useState(() =>
    todas.map(reservaCompleta).filter((r) => r.orquesta.id === cuenta.id),
  )
  const [soloPendientes, setSoloPendientes] = useState(true)
  const [aviso, setAviso] = useState('')

  // Agrupar por fecha
  const porFecha = {}
  for (const r of reservas) {
    if (soloPendientes && r.estado !== 'pendiente') continue
    ;(porFecha[r.disponibilidad.fecha] ??= []).push(r)
  }
  const fechas = Object.keys(porFecha).sort()
  const pendientes = reservas.filter((r) => r.estado === 'pendiente').length

  function aceptar(reserva) {
    // TODO: POST /mi-orquesta/reservas/{id}/aceptar
    const otras = reservas.filter(
      (r) => r.id !== reserva.id && r.disponibilidad_id === reserva.disponibilidad_id && r.estado === 'pendiente',
    ).length
    setAviso(
      [
        t('solicitudes.avisoAceptada', { nombre: reserva.usuario.nombre, fecha: fechaCorta(reserva.disponibilidad.fecha) }),
        otras > 0 && t('solicitudes.otrasRechazadas', { n: otras }),
      ]
        .filter(Boolean)
        .join(' '),
    )
    setReservas(
      reservas.map((r) => {
        if (r.id === reserva.id) return { ...r, estado: 'aceptada' }
        if (r.disponibilidad_id === reserva.disponibilidad_id && r.estado === 'pendiente')
          return { ...r, estado: 'rechazada' }
        return r
      }),
    )
  }

  function rechazar(reserva) {
    // TODO: POST /mi-orquesta/reservas/{id}/rechazar
    setAviso(t('solicitudes.avisoRechazada', { nombre: reserva.usuario.nombre }))
    setReservas(reservas.map((r) => (r.id === reserva.id ? { ...r, estado: 'rechazada' } : r)))
  }

  return (
    <div className="contenedor pagina">
      <div className="pagina-cabecera">
        <div>
          <h1>{t('solicitudes.titulo')}</h1>
          <p>
            {pendientes === 0 ? t('solicitudes.todasRespondidas') : t('solicitudes.esperan', { n: pendientes })}
          </p>
        </div>
      </div>

      <div className="filtros" role="group" aria-label={t('solicitudes.mostrar')}>
        <button type="button" className="filtro" aria-pressed={soloPendientes} onClick={() => setSoloPendientes(true)}>
          {t('solicitudes.sinResponder')}
          <span className="cuenta">{pendientes}</span>
        </button>
        <button type="button" className="filtro" aria-pressed={!soloPendientes} onClick={() => setSoloPendientes(false)}>
          {t('solicitudes.todas')}
          <span className="cuenta">{reservas.length}</span>
        </button>
      </div>

      {aviso && (
        <p className="aviso aviso--hecho" role="status">
          {aviso}
        </p>
      )}

      {fechas.length === 0 ? (
        <div className="vacio">
          <p>{t('solicitudes.vacio')}</p>
        </div>
      ) : (
        <div className="dias-solicitados">
          {fechas.map((fecha) => {
            const grupo = porFecha[fecha]
            const competidas = grupo.filter((r) => r.estado === 'pendiente').length
            return (
              <section key={fecha} className="dia-solicitado">
                <header className="dia-solicitado-cabecera">
                  <FechaTaco fecha={fecha} />
                  <div>
                    <h2>{fechaLarga(fecha)}</h2>
                    {competidas > 1 && <p className="texto-suave">{t('solicitudes.competencia', { n: competidas })}</p>}
                  </div>
                </header>

                <ul className="reservas">
                  {grupo.map((r) => (
                    <li key={r.id} className={`reserva reserva--${r.estado} solicitud-fila`}>
                      <div className="reserva-cuerpo">
                        <div className="reserva-titulo">
                          <h3>{r.usuario.nombre}</h3>
                          <Estado
                            estado={r.estado}
                            texto={r.estado === 'pendiente' ? t('solicitudes.pendiente') : undefined}
                          />
                        </div>
                        <dl className="datos">
                          <div><dt>{t('campos.tipo')}</dt><dd>{t(`tipos.${r.usuario.tipo}`)}</dd></div>
                          {r.usuario.municipio && (
                            <div>
                              <dt>{t('campos.municipio')}</dt>
                              <dd>{[r.usuario.municipio, r.usuario.provincia].filter(Boolean).join(', ')}</dd>
                            </div>
                          )}
                          <div><dt>{t('campos.lugar')}</dt><dd>{r.lugar || t('comun.sinIndicar')}</dd></div>
                          <div><dt>{t('campos.hora')}</dt><dd>{r.hora_inicio || t('comun.sinIndicar')}</dd></div>
                        </dl>
                        {r.mensaje && <p className="reserva-mensaje">{r.mensaje}</p>}
                        <p className="reserva-pie">{t('solicitudes.recibida', { fecha: fechaCorta(r.creado_en) })}</p>
                      </div>

                      <div className="reserva-acciones">
                        {r.estado === 'pendiente' && (
                          <>
                            <button type="button" className="boton boton--verde boton--pequeno" onClick={() => aceptar(r)}>
                              {t('solicitudes.aceptar')}
                            </button>
                            <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => rechazar(r)}>
                              {t('solicitudes.rechazar')}
                            </button>
                          </>
                        )}
                        {r.usuario.telefono && (
                          <a href={enlaceTelefono(r.usuario.telefono)} className="boton boton--discreto boton--pequeno">
                            <IconoTelefono />
                            {t('comun.llamar')}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
