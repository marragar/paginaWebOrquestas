// Entrar y crear cuenta comparten pantalla: primero se elige quién eres (SPEC §2).
// En la interfaz se dice "Organizo fiestas" / "Tengo una orquesta" en vez de "usuario" / "orquesta".
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTextos } from '../context/Preferencias.jsx'
import { useSesion } from '../context/SesionDemo.jsx'
import SelectorProvincia from '../components/SelectorProvincia.jsx'
import './Acceso.css'

const TIPOS = ['ayuntamiento', 'junta_vecinal', 'comision_fiestas', 'particular']

export default function Acceso({ modo }) {
  const { t } = useTextos()
  const [params, setParams] = useSearchParams()
  const cuenta = params.get('cuenta') === 'orquesta' ? 'orquesta' : 'usuario'
  const { setRol } = useSesion()
  const navigate = useNavigate()
  const esRegistro = modo === 'registro'

  function enviar(e) {
    e.preventDefault()
    // TODO: POST /auth/{usuarios|orquestas}/{login|registro}. De momento solo simula la sesión.
    setRol(cuenta)
    navigate(cuenta === 'orquesta' ? '/mi-orquesta/calendario' : '/orquestas')
  }

  const destinoCambio = `${esRegistro ? '/entrar' : '/registro'}${cuenta === 'orquesta' ? '?cuenta=orquesta' : ''}`

  return (
    <div className="contenedor pagina acceso">
      <h1>{esRegistro ? t('acceso.registro') : t('acceso.entrar')}</h1>

      <div className="acceso-eleccion" role="radiogroup" aria-label={t('acceso.comoUsaras')}>
        <button
          type="button"
          role="radio"
          aria-checked={cuenta === 'usuario'}
          className="acceso-opcion"
          onClick={() => setParams({})}
        >
          <strong>{t('acceso.organizo')}</strong>
          <span>{t('acceso.organizoTexto')}</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={cuenta === 'orquesta'}
          className="acceso-opcion"
          onClick={() => setParams({ cuenta: 'orquesta' })}
        >
          <strong>{t('acceso.tengoOrquesta')}</strong>
          <span>{t('acceso.tengoOrquestaTexto')}</span>
        </button>
      </div>

      <form className="panel formulario acceso-formulario" onSubmit={enviar} key={`${modo}-${cuenta}`}>
        {esRegistro && cuenta === 'usuario' && <CamposOrganizador />}
        {esRegistro && cuenta === 'orquesta' && <CamposOrquesta />}

        <div className="campo">
          <label htmlFor="a-email">{t('campos.email')}</label>
          <input id="a-email" type="email" autoComplete="email" required />
        </div>
        <div className="campo">
          <label htmlFor="a-password">{t('campos.contrasena')}</label>
          <input
            id="a-password"
            type="password"
            autoComplete={esRegistro ? 'new-password' : 'current-password'}
            aria-describedby={esRegistro ? 'a-password-ayuda' : undefined}
            required
          />
          {esRegistro && <span className="ayuda" id="a-password-ayuda">{t('campos.contrasenaMinimo')}</span>}
        </div>

        {esRegistro && cuenta === 'orquesta' && <p className="aviso">{t('acceso.avisoOrquesta')}</p>}

        <button className="boton">{esRegistro ? t('acceso.registro') : t('acceso.entrar')}</button>
      </form>

      <p className="acceso-cambio">
        {esRegistro ? t('acceso.yaCuenta') : t('acceso.noCuenta')}{' '}
        <Link to={destinoCambio}>{esRegistro ? t('nav.entrar') : t('nav.crearCuenta')}</Link>
      </p>
    </div>
  )
}

function CamposOrganizador() {
  const { t } = useTextos()
  return (
    <>
      <div className="campo">
        <label htmlFor="r-nombre">{t('campos.nombre')}</label>
        <input id="r-nombre" placeholder={t('acceso.nombreEjemplo')} required />
      </div>
      <div className="campo">
        <label htmlFor="r-tipo">{t('campos.tipoOrganizador')}</label>
        <select id="r-tipo" required defaultValue="">
          <option value="" disabled>{t('campos.eligeUno')}</option>
          {TIPOS.map((tipo) => (
            <option key={tipo} value={tipo}>{t(`tipos.${tipo}`)}</option>
          ))}
        </select>
      </div>
      <div className="acceso-doble">
        <div className="campo">
          <label htmlFor="r-municipio">{t('campos.municipio')}</label>
          <input id="r-municipio" />
        </div>
        <div className="campo">
          <label htmlFor="r-provincia">{t('campos.provincia')}</label>
          <SelectorProvincia id="r-provincia" />
        </div>
      </div>
    </>
  )
}

function CamposOrquesta() {
  const { t } = useTextos()
  return (
    <>
      <div className="campo">
        <label htmlFor="r-nombre">{t('acceso.nombreOrquesta')}</label>
        <input id="r-nombre" required />
      </div>
      <div className="acceso-doble">
        <div className="campo">
          <label htmlFor="r-provincia">{t('campos.provincia')}</label>
          <SelectorProvincia id="r-provincia" />
        </div>
        <div className="campo">
          <label htmlFor="r-musicos">{t('campos.numMusicos')}</label>
          <input id="r-musicos" type="number" min="1" inputMode="numeric" />
        </div>
      </div>
    </>
  )
}
