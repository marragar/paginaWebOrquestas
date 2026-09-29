import { useRef, useState } from 'react'
import Calendario from '../../components/Calendario.jsx'
import Estado from '../../components/Estado.jsx'
import FechaTaco from '../../components/FechaTaco.jsx'
import { useFormato, useTextos } from '../../context/Preferencias.jsx'
import { useSesion } from '../../context/SesionDemo.jsx'
import { disponibilidadesDe } from '../../datos/demo.js'
import { aTexto } from '../../utilidades/formato.js'
import './PanelCalendario.css'

export default function PanelCalendario() {
  const { t } = useTextos()
  const { euros, fechaLarga } = useFormato()
  const { cuenta } = useSesion()
  const panelAcciones = useRef(null)
  // { 'AAAA-MM-DD': disponibilidad } — copia local para poder tocarla sin backend
  const [dias, setDias] = useState(() =>
    Object.fromEntries(disponibilidadesDe(cuenta.id).map((d) => [d.fecha, d])),
  )
  const [seleccion, setSeleccion] = useState([])
  const [precio, setPrecio] = useState('')

  const hoy = aTexto(new Date())
  const futuras = Object.values(dias).filter((d) => d.fecha >= hoy)
  const contar = (estado) => futuras.filter((d) => d.estado === estado).length

  // Qué hay en la selección
  const nuevas = seleccion.filter((f) => !dias[f])
  const libres = seleccion.filter((f) => dias[f]?.estado === 'libre')
  const bloqueadas = seleccion.filter((f) => dias[f]?.estado === 'bloqueada')
  const reservadas = seleccion.filter((f) => dias[f]?.estado === 'reservada')

  function alternar(fecha) {
    setSeleccion((s) => (s.includes(fecha) ? s.filter((f) => f !== fecha) : [...s, fecha].sort()))
  }

  function cambiar(fechas, estado) {
    // TODO: POST / PATCH /mi-orquesta/disponibilidad
    const copia = { ...dias }
    for (const f of fechas) {
      copia[f] = {
        ...(copia[f] ?? { id: `nueva-${f}`, fecha: f, notas: '' }),
        estado,
        precio: precio ? Number(precio) : (copia[f]?.precio ?? null),
      }
    }
    setDias(copia)
    setSeleccion([])
    setPrecio('')
  }

  function retirar(fechas) {
    // TODO: DELETE /mi-orquesta/disponibilidad/{id}
    const copia = { ...dias }
    for (const f of fechas) delete copia[f]
    setDias(copia)
    setSeleccion([])
  }

  function verOpciones() {
    panelAcciones.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`contenedor pagina ${seleccion.length > 0 ? 'con-barra-accion' : ''}`}>
      <div className="pagina-cabecera">
        <div>
          <h1>{t('panel.titulo')}</h1>
          <p>{t('panel.subtitulo')}</p>
        </div>
        <dl className="resumen">
          <div className="resumen--libre"><dt>{t('panel.libres')}</dt><dd>{contar('libre')}</dd></div>
          <div className="resumen--reservada"><dt>{t('panel.reservadas')}</dt><dd>{contar('reservada')}</dd></div>
          <div className="resumen--bloqueada"><dt>{t('panel.bloqueadas')}</dt><dd>{contar('bloqueada')}</dd></div>
        </dl>
      </div>

      {!cuenta.verificada && <p className="aviso">{t('panel.noVerificada')}</p>}

      <div className="panel-calendario">
        <Calendario
          dias={dias}
          seleccionadas={seleccion}
          esSeleccionable={() => true}
          onDia={alternar}
        />

        <aside className="panel acciones-dia" aria-live="polite" ref={panelAcciones}>
          {seleccion.length === 0 ? (
            <>
              <h2>{t('panel.sinMarcados')}</h2>
              <p className="texto-suave">{t('panel.sinMarcadosTexto')}</p>
            </>
          ) : (
            <>
              <div className="acciones-dia-cabecera">
                <h2>{t('panel.marcados', { n: seleccion.length })}</h2>
                <button type="button" className="boton boton--discreto boton--pequeno" onClick={() => setSeleccion([])}>
                  {t('panel.desmarcar')}
                </button>
              </div>

              <ul className="marcados">
                {seleccion.map((f) => (
                  <li key={f}>
                    <FechaTaco fecha={f} pequeno />
                    <span className="marcados-fecha">{fechaLarga(f)}</span>
                    {dias[f] ? (
                      <Estado estado={dias[f].estado} />
                    ) : (
                      <span className="texto-suave">{t('panel.sinPublicar')}</span>
                    )}
                  </li>
                ))}
              </ul>

              {(nuevas.length > 0 || libres.length > 0) && (
                <div className="campo">
                  <label htmlFor="c-precio">{t('panel.precioDias')}</label>
                  <input
                    id="c-precio"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="100"
                    placeholder={t('panel.precioPlaceholder', { precio: cuenta.precio_base })}
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    aria-describedby="c-precio-ayuda"
                  />
                  <span className="ayuda" id="c-precio-ayuda">
                    {t('panel.precioAyuda', { precio: euros(cuenta.precio_base) })}
                  </span>
                </div>
              )}

              <div className="acciones acciones-dia-botones">
                {nuevas.length > 0 && (
                  <button type="button" className="boton boton--verde" onClick={() => cambiar(nuevas, 'libre')}>
                    {t('panel.publicar', { n: nuevas.length })}
                  </button>
                )}
                {libres.length > 0 && precio && (
                  <button type="button" className="boton boton--secundario" onClick={() => cambiar(libres, 'libre')}>
                    {t('panel.cambiarPrecio')}
                  </button>
                )}
                {nuevas.length + libres.length > 0 && (
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => cambiar([...nuevas, ...libres], 'bloqueada')}
                  >
                    {t('panel.bloquear')}
                  </button>
                )}
                {bloqueadas.length > 0 && (
                  <button type="button" className="boton boton--secundario" onClick={() => cambiar(bloqueadas, 'libre')}>
                    {t('panel.desbloquear')}
                  </button>
                )}
                {libres.length + bloqueadas.length > 0 && (
                  <button
                    type="button"
                    className="boton boton--discreto"
                    onClick={() => retirar([...libres, ...bloqueadas])}
                  >
                    {t('panel.retirar')}
                  </button>
                )}
              </div>

              {reservadas.length > 0 && <p className="nota-reservada">{t('panel.notaReservada')}</p>}
            </>
          )}
        </aside>
      </div>

      {/* Móvil: con días marcados, acceso directo a las opciones que quedan debajo del calendario */}
      {seleccion.length > 0 && (
        <div className="barra-accion">
          <div className="barra-accion-texto">
            <strong>{t('panel.marcados', { n: seleccion.length })}</strong>
          </div>
          <button type="button" className="boton boton--discreto" onClick={() => setSeleccion([])}>
            {t('panel.desmarcar')}
          </button>
          <button type="button" className="boton" onClick={verOpciones}>
            {t('panel.verOpciones')}
          </button>
        </div>
      )}
    </div>
  )
}
