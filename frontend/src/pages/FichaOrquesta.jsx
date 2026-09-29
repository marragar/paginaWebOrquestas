import { useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Calendario from '../components/Calendario.jsx'
import FechaTaco from '../components/FechaTaco.jsx'
import { IconoTelefono, IconoWhatsapp, enlaceTelefono, enlaceWhatsapp } from '../components/Iconos.jsx'
import { useFormato, useTextos } from '../context/Preferencias.jsx'
import { useSesion } from '../context/SesionDemo.jsx'
import { disponibilidadesDe, orquestaPorId, precioDe } from '../datos/demo.js'
import './FichaOrquesta.css'

export default function FichaOrquesta() {
  const { t } = useTextos()
  const { euros, fechaLarga } = useFormato()
  const { rol } = useSesion()
  const { id } = useParams()
  const [params] = useSearchParams()
  const orquesta = orquestaPorId(id)
  const formulario = useRef(null)

  const [fecha, setFecha] = useState(params.get('fecha'))
  const [enviada, setEnviada] = useState(false)

  if (!orquesta) {
    return (
      <div className="contenedor pagina">
        <div className="vacio">
          <p>{t('ficha.noExiste')}</p>
          <Link to="/orquestas" className="boton boton--secundario">{t('ficha.verOrquestas')}</Link>
        </div>
      </div>
    )
  }

  // Al organizador solo se le enseñan los días libres (GET /orquestas/{id}/disponibilidad)
  const dias = Object.fromEntries(
    disponibilidadesDe(orquesta.id)
      .filter((d) => d.estado === 'libre')
      .map((d) => [d.fecha, d]),
  )
  const elegida = fecha ? dias[fecha] : null
  const puedePedir = rol === 'usuario' || rol === 'admin'

  const enlaceFicha = `${window.location.origin}/orquestas/${orquesta.id}${elegida ? `?fecha=${elegida.fecha}` : ''}`
  const textoCompartir = elegida
    ? t('ficha.compartirTextoDia', { nombre: orquesta.nombre, fecha: fechaLarga(elegida.fecha) })
    : t('ficha.compartirTexto', { nombre: orquesta.nombre })

  function elegir(nueva) {
    setFecha(nueva === fecha ? null : nueva)
    setEnviada(false)
  }

  function irAlFormulario() {
    formulario.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    formulario.current?.querySelector('input, textarea, button, a')?.focus({ preventScroll: true })
  }

  return (
    <div className="contenedor pagina con-barra-accion">
      <Link to="/orquestas" className="volver">{t('ficha.volver')}</Link>

      <header className="ficha-cabecera">
        <h1 className="ficha-nombre">{orquesta.nombre}</h1>
        <dl className="ficha-datos">
          <div><dt>{t('campos.provincia')}</dt><dd>{orquesta.provincia}</dd></div>
          <div><dt>{t('campos.musicos')}</dt><dd>{orquesta.num_musicos}</dd></div>
          <div><dt>{t('campos.precioBase')}</dt><dd>{euros(orquesta.precio_base)}</dd></div>
          <div><dt>{t('campos.telefono')}</dt><dd>{orquesta.telefono}</dd></div>
        </dl>
        <p className="ficha-descripcion">{orquesta.descripcion}</p>
        <div className="acciones ficha-contacto">
          <a href={enlaceTelefono(orquesta.telefono)} className="boton boton--secundario">
            <IconoTelefono />
            {t('comun.llamar')}
          </a>
          <a
            href={enlaceWhatsapp(`${textoCompartir} ${enlaceFicha}`)}
            className="boton boton--whatsapp"
            target="_blank"
            rel="noreferrer"
          >
            <IconoWhatsapp />
            {t('comun.compartirWhatsapp')}
          </a>
        </div>
      </header>

      <div className="ficha-reserva">
        <section>
          <h2>{t('ficha.elige')}</h2>
          <Calendario
            dias={dias}
            seleccionadas={fecha ? [fecha] : []}
            esSeleccionable={(_, info) => info?.estado === 'libre'}
            onDia={elegir}
            mesInicial={fecha ? fecha.slice(0, 7) : undefined}
          />
        </section>

        <section className="ficha-solicitud" aria-live="polite" ref={formulario}>
          {elegida ? (
            <Solicitud
              orquesta={orquesta}
              disponibilidad={elegida}
              enviada={enviada}
              onEnviar={() => setEnviada(true)}
            />
          ) : (
            <div className="vacio">
              <p>{t('ficha.pulsa')}</p>
            </div>
          )}
        </section>
      </div>

      {/* Móvil: la acción principal siempre a mano */}
      {!enviada && (
        <div className="barra-accion">
          {elegida && puedePedir ? (
            <>
              <div className="barra-accion-texto">
                <strong>{fechaLarga(elegida.fecha)}</strong>
                {euros(precioDe(elegida, orquesta))}
              </div>
              <button type="button" className="boton" onClick={irAlFormulario}>
                {t('ficha.pedirDia')}
              </button>
            </>
          ) : (
            <>
              <div className="barra-accion-texto">
                <strong>{t('ficha.dudas')}</strong>
                {t('ficha.dudasTexto')}
              </div>
              <a href={enlaceTelefono(orquesta.telefono)} className="boton boton--secundario">
                <IconoTelefono />
                {t('comun.llamar')}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Solicitud({ orquesta, disponibilidad, enviada, onEnviar }) {
  const { t } = useTextos()
  const { euros, fechaLarga } = useFormato()
  const { rol } = useSesion()
  const precio = precioDe(disponibilidad, orquesta)

  const resumen = (
    <div className="solicitud-resumen">
      <FechaTaco fecha={disponibilidad.fecha} />
      <div>
        <p className="solicitud-fecha">{fechaLarga(disponibilidad.fecha)}</p>
        <p className="solicitud-precio">{euros(precio)}</p>
        {disponibilidad.notas && <p className="texto-suave">{disponibilidad.notas}</p>}
      </div>
    </div>
  )

  if (enviada) {
    return (
      <div className="panel solicitud">
        {resumen}
        <h3>{t('solicitud.enviada')}</h3>
        <p>{t('solicitud.enviadaTexto', { orquesta: orquesta.nombre })}</p>
        <Link to="/mis-reservas" className="boton boton--secundario">{t('solicitud.irReservas')}</Link>
      </div>
    )
  }

  if (rol !== 'usuario' && rol !== 'admin') {
    return (
      <div className="panel solicitud">
        {resumen}
        {rol === 'orquesta' ? (
          <p>{t('solicitud.soloOrganizadores')}</p>
        ) : (
          <>
            <p>{t('solicitud.necesitasCuenta')}</p>
            <div className="acciones">
              <Link to="/entrar" className="boton">{t('nav.entrar')}</Link>
              <Link to="/registro" className="boton boton--secundario">{t('nav.crearCuenta')}</Link>
            </div>
          </>
        )}
      </div>
    )
  }

  function enviar(e) {
    e.preventDefault()
    onEnviar() // TODO: POST /reservas
  }

  return (
    <form className="panel solicitud formulario" onSubmit={enviar}>
      {resumen}
      <div className="campo">
        <label htmlFor="s-lugar">{t('solicitud.lugar')}</label>
        <input id="s-lugar" placeholder={t('solicitud.lugarEjemplo')} />
      </div>
      <div className="campo">
        <label htmlFor="s-hora">{t('solicitud.hora')}</label>
        <input id="s-hora" type="time" defaultValue="23:00" />
      </div>
      <div className="campo">
        <label htmlFor="s-mensaje">
          {t('solicitud.mensaje')} <span className="texto-suave">({t('comun.opcional').toLowerCase()})</span>
        </label>
        <textarea id="s-mensaje" placeholder={t('solicitud.mensajeEjemplo')} />
      </div>
      <button className="boton">{t('solicitud.enviar')}</button>
      <p className="ayuda-final">{t('solicitud.ayuda')}</p>
    </form>
  )
}
