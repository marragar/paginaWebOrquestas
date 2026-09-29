import { Link, useSearchParams } from 'react-router-dom'
import FechaTaco from '../components/FechaTaco.jsx'
import { useFormato, useTextos } from '../context/Preferencias.jsx'
import { PROVINCIAS, disponibilidadesDe, orquestas } from '../datos/demo.js'
import { aTexto } from '../utilidades/formato.js'
import './Orquestas.css'

export default function Orquestas() {
  const { t } = useTextos()
  const { euros, fechaLarga } = useFormato()
  const [params, setParams] = useSearchParams()
  const provincia = params.get('provincia') ?? ''
  const fecha = params.get('fecha') ?? ''
  const hoy = aTexto(new Date())

  function cambiarFiltro(nombre, valor) {
    const nuevos = new URLSearchParams(params)
    if (valor) nuevos.set(nombre, valor)
    else nuevos.delete(nombre)
    setParams(nuevos)
  }

  // En la versión real este filtrado lo hará GET /orquestas?provincia=&fecha=
  const resultado = orquestas
    .filter((o) => o.verificada)
    .filter((o) => !provincia || o.provincia === provincia)
    .map((o) => ({
      ...o,
      libres: disponibilidadesDe(o.id).filter((d) => d.estado === 'libre' && d.fecha >= hoy),
    }))
    .filter((o) => !fecha || o.libres.some((d) => d.fecha === fecha))

  const subtitulo = [
    fecha ? t('orquestas.conDia', { fecha: fechaLarga(fecha) }) : t('orquestas.todas'),
    provincia && t('orquestas.enProvincia', { provincia }),
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="contenedor pagina">
      <div className="pagina-cabecera">
        <div>
          <h1>{t('orquestas.titulo')}</h1>
          <p>{subtitulo}</p>
        </div>
      </div>

      <div className="listado">
        <aside className="listado-filtros" aria-label={t('orquestas.filtros')}>
          <div className="campo">
            <label htmlFor="f-provincia">{t('campos.provincia')}</label>
            <select id="f-provincia" value={provincia} onChange={(e) => cambiarFiltro('provincia', e.target.value)}>
              <option value="">{t('inicio.todas')}</option>
              {PROVINCIAS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="f-fecha">{t('orquestas.diaLibre')}</label>
            <input
              id="f-fecha"
              type="date"
              min={hoy}
              value={fecha}
              onChange={(e) => cambiarFiltro('fecha', e.target.value)}
            />
          </div>
          {(provincia || fecha) && (
            <button type="button" className="boton boton--discreto listado-quitar" onClick={() => setParams({})}>
              {t('orquestas.quitarFiltros')}
            </button>
          )}
        </aside>

        <section aria-live="polite">
          {resultado.length === 0 ? (
            <div className="vacio">
              <p>{t('orquestas.vacio')}</p>
              <button type="button" className="boton boton--secundario" onClick={() => setParams({})}>
                {t('orquestas.quitarFiltros')}
              </button>
            </div>
          ) : (
            <ul className="orquestas">
              {resultado.map((o) => (
                <li key={o.id} className="orquesta-fila">
                  <div className="orquesta-info">
                    <h2>
                      <Link to={`/orquestas/${o.id}${fecha ? `?fecha=${fecha}` : ''}`}>{o.nombre}</Link>
                    </h2>
                    <dl className="datos">
                      <div><dt>{t('campos.provincia')}</dt><dd>{o.provincia}</dd></div>
                      <div><dt>{t('campos.musicos')}</dt><dd>{o.num_musicos}</dd></div>
                      <div><dt>{t('campos.desde')}</dt><dd>{euros(o.precio_base)}</dd></div>
                    </dl>
                    <p className="orquesta-descripcion">{o.descripcion}</p>
                  </div>

                  <div className="orquesta-fechas">
                    {o.libres.length > 0 ? (
                      <>
                        <span className="orquesta-fechas-titulo">{t('orquestas.proximos')}</span>
                        <div className="orquesta-tacos">
                          {o.libres.slice(0, 4).map((d) => (
                            <Link
                              key={d.id}
                              to={`/orquestas/${o.id}?fecha=${d.fecha}`}
                              aria-label={t('orquestas.pedirDia', { fecha: fechaLarga(d.fecha) })}
                            >
                              <FechaTaco fecha={d.fecha} pequeno />
                            </Link>
                          ))}
                          {o.libres.length > 4 && (
                            <Link
                              to={`/orquestas/${o.id}`}
                              className="orquesta-mas"
                              aria-label={t('orquestas.masDias', { n: o.libres.length - 4 })}
                            >
                              +{o.libres.length - 4}
                            </Link>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="texto-suave">{t('orquestas.sinFechas')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
