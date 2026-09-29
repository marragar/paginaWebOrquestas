import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Banderines from '../components/Banderines.jsx'
import Confeti from '../components/Confeti.jsx'
import FechaTaco from '../components/FechaTaco.jsx'
import { useFormato, useTextos } from '../context/Preferencias.jsx'
import { PROVINCIAS, disponibilidades, orquestaPorId, precioDe } from '../datos/demo.js'
import { aTexto } from '../utilidades/formato.js'
import { useRevelar } from '../utilidades/useRevelar.js'
import './Inicio.css'

export default function Inicio() {
  const { t } = useTextos()
  const { euros } = useFormato()
  const navigate = useNavigate()
  const lineasTitulo = t('inicio.titulo')
  const [provincia, setProvincia] = useState('')
  const [fecha, setFecha] = useState('')
  const [refPrograma, programaVisible] = useRevelar()
  const [refPasos, pasosVisibles] = useRevelar()
  const [refOrquestas, orquestasVisible] = useRevelar()

  const hoy = aTexto(new Date())
  const proximas = disponibilidades
    .filter((d) => d.estado === 'libre' && d.fecha >= hoy && orquestaPorId(d.orquesta_id).verificada)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 6)

  function buscar(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (provincia) params.set('provincia', provincia)
    if (fecha) params.set('fecha', fecha)
    navigate(`/orquestas?${params}`)
  }

  return (
    <>
      <section className="portada">
        <div className="focos" aria-hidden="true">
          <span className="foco foco--1" />
          <span className="foco foco--2" />
        </div>
        <Confeti />
        <Banderines className="portada-banderines" />
        <div className="contenedor portada-contenido">
          <h1 className="portada-titulo" aria-label={lineasTitulo.join(' ')}>
            {lineasTitulo.map((linea, i) => (
              <span key={linea} className="titulo-linea" aria-hidden="true">
                <span style={{ '--i': i }}>{linea}</span>
              </span>
            ))}
          </h1>
          <p className="portada-texto">{t('inicio.texto')}</p>

          <form className="buscador" onSubmit={buscar}>
            <div className="campo">
              <label htmlFor="b-provincia">{t('campos.provincia')}</label>
              <select id="b-provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
                <option value="">{t('inicio.todas')}</option>
                {PROVINCIAS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="b-fecha">{t('inicio.diaFiesta')}</label>
              <input id="b-fecha" type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <button className="boton buscador-boton">{t('inicio.buscar')}</button>
          </form>
        </div>
      </section>

      <section
        ref={refPrograma}
        className={`contenedor inicio-bloque revelar ${programaVisible ? 'revelar--visible' : ''}`}
      >
        <h2>{t('inicio.proximas')}</h2>
        <ul className="programa">
          {proximas.map((d, i) => {
            const o = orquestaPorId(d.orquesta_id)
            return (
              <li key={d.id} style={{ '--i': i }}>
                <Link to={`/orquestas/${o.id}?fecha=${d.fecha}`} className="programa-fila">
                  <FechaTaco fecha={d.fecha} />
                  <span className="programa-nombre">{o.nombre}</span>
                  <span className="programa-dato">{o.provincia}</span>
                  <span className="programa-dato">{t('comun.musicos', { n: o.num_musicos })}</span>
                  <span className="programa-precio">{euros(precioDe(d, o))}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        <Link to="/orquestas" className="boton boton--secundario">
          {t('inicio.verTodas')}
        </Link>
      </section>

      <section
        ref={refPasos}
        className={`contenedor inicio-bloque revelar ${pasosVisibles ? 'revelar--visible' : ''}`}
      >
        <h2>{t('inicio.comoTitulo')}</h2>
        <ol className="pasos">
          {t('inicio.pasos').map((p, i) => (
            <li key={p.titulo} className="paso" style={{ '--i': i }}>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        ref={refOrquestas}
        className={`contenedor inicio-bloque revelar ${orquestasVisible ? 'revelar--visible' : ''}`}
      >
        <div className="para-orquestas">
          <div className="luces" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ '--i': i }} />
            ))}
          </div>
          <div>
            <h2>{t('inicio.orqTitulo')}</h2>
            <p>{t('inicio.orqTexto')}</p>
          </div>
          <Link to="/registro?cuenta=orquesta" className="boton">
            {t('inicio.orqBoton')}
          </Link>
        </div>
      </section>
    </>
  )
}
