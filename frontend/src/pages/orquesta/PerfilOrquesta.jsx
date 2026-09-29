import { useState } from 'react'
import { Link } from 'react-router-dom'
import Estado from '../../components/Estado.jsx'
import SelectorProvincia from '../../components/SelectorProvincia.jsx'
import { useTextos } from '../../context/Preferencias.jsx'
import { useSesion } from '../../context/SesionDemo.jsx'

export default function PerfilOrquesta() {
  const { t } = useTextos()
  const { cuenta } = useSesion()
  const [guardado, setGuardado] = useState(false)

  function guardar(e) {
    e.preventDefault()
    setGuardado(true) // TODO: PUT /mi-orquesta
  }

  return (
    <div className="contenedor pagina pagina--estrecha">
      <div className="pagina-cabecera">
        <div>
          <h1>{t('perfilOrquesta.titulo')}</h1>
          <p>{t('perfilOrquesta.subtitulo')}</p>
        </div>
        <Estado estado={cuenta.verificada ? 'verificada' : 'sin_verificar'} />
      </div>

      <form className="panel formulario formulario--dos" onSubmit={guardar} onChange={() => setGuardado(false)}>
        <div className="campo campo--ancho">
          <label htmlFor="o-nombre">{t('acceso.nombreOrquesta')}</label>
          <input id="o-nombre" defaultValue={cuenta.nombre} required />
        </div>
        <div className="campo campo--ancho">
          <label htmlFor="o-descripcion">{t('perfilOrquesta.descripcion')}</label>
          <textarea
            id="o-descripcion"
            rows="5"
            defaultValue={cuenta.descripcion}
            aria-describedby="o-descripcion-ayuda"
          />
          <span className="ayuda" id="o-descripcion-ayuda">{t('perfilOrquesta.descripcionAyuda')}</span>
        </div>
        <div className="campo">
          <label htmlFor="o-provincia">{t('campos.provincia')}</label>
          <SelectorProvincia id="o-provincia" defaultValue={cuenta.provincia} />
        </div>
        <div className="campo">
          <label htmlFor="o-musicos">{t('campos.numMusicos')}</label>
          <input id="o-musicos" type="number" inputMode="numeric" min="1" defaultValue={cuenta.num_musicos} />
        </div>
        <div className="campo">
          <label htmlFor="o-precio">{t('perfilOrquesta.precioBase')}</label>
          <input
            id="o-precio"
            type="number"
            inputMode="numeric"
            min="0"
            step="100"
            defaultValue={cuenta.precio_base}
            aria-describedby="o-precio-ayuda"
          />
          <span className="ayuda" id="o-precio-ayuda">{t('perfilOrquesta.precioBaseAyuda')}</span>
        </div>
        <div className="campo">
          <label htmlFor="o-telefono">{t('campos.telefono')}</label>
          <input id="o-telefono" type="tel" autoComplete="tel" defaultValue={cuenta.telefono} />
        </div>
        <div className="campo campo--ancho">
          <label htmlFor="o-email">{t('campos.email')}</label>
          <input id="o-email" type="email" defaultValue={cuenta.email} disabled aria-describedby="o-email-ayuda" />
          <span className="ayuda" id="o-email-ayuda">{t('comun.emailNoCambia')}</span>
        </div>
        <div className="campo--ancho acciones acciones--centradas">
          <button className="boton">{t('comun.guardarCambios')}</button>
          <Link to={`/orquestas/${cuenta.id}`} className="boton boton--discreto">
            {t('perfilOrquesta.verFicha')}
          </Link>
          {guardado && <span role="status" className="texto-suave">{t('comun.cambiosGuardados')}</span>}
        </div>
      </form>
    </div>
  )
}
