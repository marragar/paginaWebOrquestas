import { useState } from 'react'
import { useTextos } from '../../context/Preferencias.jsx'
import { useSesion } from '../../context/SesionDemo.jsx'
import SelectorProvincia from '../../components/SelectorProvincia.jsx'

const TIPOS = ['ayuntamiento', 'junta_vecinal', 'comision_fiestas', 'particular']

export default function PerfilUsuario() {
  const { t } = useTextos()
  const { cuenta } = useSesion()
  const [guardado, setGuardado] = useState(false)

  function guardar(e) {
    e.preventDefault()
    setGuardado(true) // TODO: PUT /mi-perfil
  }

  return (
    <div className="contenedor pagina pagina--estrecha">
      <div className="pagina-cabecera">
        <div>
          <h1>{t('perfilUsuario.titulo')}</h1>
          <p>{t('perfilUsuario.subtitulo')}</p>
        </div>
      </div>

      <form className="panel formulario formulario--dos" onSubmit={guardar} onChange={() => setGuardado(false)}>
        <div className="campo campo--ancho">
          <label htmlFor="p-nombre">{t('campos.nombre')}</label>
          <input id="p-nombre" defaultValue={cuenta?.nombre} required />
        </div>
        <div className="campo">
          <label htmlFor="p-tipo">{t('campos.tipoOrganizador')}</label>
          <select id="p-tipo" defaultValue={cuenta?.tipo}>
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>{t(`tipos.${tipo}`)}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="p-cif">{t('campos.cif')}</label>
          <input id="p-cif" defaultValue={cuenta?.cif} aria-describedby="p-cif-ayuda" />
          <span className="ayuda" id="p-cif-ayuda">{t('perfilUsuario.cifAyuda')}</span>
        </div>
        <div className="campo">
          <label htmlFor="p-municipio">{t('campos.municipio')}</label>
          <input id="p-municipio" defaultValue={cuenta?.municipio} />
        </div>
        <div className="campo">
          <label htmlFor="p-provincia">{t('campos.provincia')}</label>
          <SelectorProvincia id="p-provincia" defaultValue={cuenta?.provincia} />
        </div>
        <div className="campo">
          <label htmlFor="p-telefono">{t('campos.telefono')}</label>
          <input id="p-telefono" type="tel" autoComplete="tel" defaultValue={cuenta?.telefono} />
        </div>
        <div className="campo">
          <label htmlFor="p-email">{t('campos.email')}</label>
          <input id="p-email" type="email" defaultValue={cuenta?.email} disabled aria-describedby="p-email-ayuda" />
          <span className="ayuda" id="p-email-ayuda">{t('comun.emailNoCambia')}</span>
        </div>
        <div className="campo--ancho acciones acciones--centradas">
          <button className="boton">{t('comun.guardarCambios')}</button>
          {guardado && <span role="status" className="texto-suave">{t('comun.cambiosGuardados')}</span>}
        </div>
      </form>
    </div>
  )
}
