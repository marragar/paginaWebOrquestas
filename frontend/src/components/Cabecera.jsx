import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTextos } from '../context/Preferencias.jsx'
import { useSesion } from '../context/SesionDemo.jsx'
import { reservas, reservaCompleta } from '../datos/demo.js'
import { BotonAjustes, ControlesAjustes } from './Ajustes.jsx'
import { IconoMenu } from './Iconos.jsx'
import './Cabecera.css'

// Enlaces del menú según el tipo de cuenta
function enlacesPara(rol, cuenta) {
  switch (rol) {
    case 'usuario':
      return [
        { to: '/orquestas', texto: 'nav.buscar' },
        { to: '/mis-reservas', texto: 'nav.misReservas' },
        { to: '/mi-perfil', texto: 'nav.miPerfil' },
      ]
    case 'orquesta': {
      const pendientes = reservas
        .map(reservaCompleta)
        .filter((r) => r.orquesta.id === cuenta.id && r.estado === 'pendiente').length
      return [
        { to: '/mi-orquesta/calendario', texto: 'nav.calendario' },
        { to: '/mi-orquesta/solicitudes', texto: 'nav.solicitudes', aviso: pendientes },
        { to: '/mi-orquesta/perfil', texto: 'nav.perfil' },
      ]
    }
    case 'admin':
      return [
        { to: '/orquestas', texto: 'nav.orquestas' },
        { to: '/admin', texto: 'nav.admin' },
      ]
    default:
      return [{ to: '/orquestas', texto: 'nav.buscar' }]
  }
}

export default function Cabecera() {
  const { t } = useTextos()
  const { rol, setRol, cuenta } = useSesion()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const enlaces = enlacesPara(rol, cuenta)

  // Al cambiar de página se cierra el menú del móvil
  useEffect(() => setMenuAbierto(false), [pathname, rol])

  function salir() {
    setRol('visitante')
    navigate('/')
  }

  const listaEnlaces = enlaces.map((e) => (
    <NavLink key={e.to} to={e.to} className="cabecera-enlace">
      {t(e.texto)}
      {e.aviso > 0 && (
        <span className="cabecera-aviso">
          <span aria-hidden="true">{e.aviso}</span>
          <span className="solo-lectores">{t('nav.sinResponder', { n: e.aviso })}</span>
        </span>
      )}
    </NavLink>
  ))

  const botonesCuenta = cuenta ? (
    <>
      <span className="cabecera-nombre">{cuenta.nombre}</span>
      <button type="button" className="cabecera-boton" onClick={salir}>
        {t('nav.salir')}
      </button>
    </>
  ) : (
    <>
      <Link to="/entrar" className="cabecera-enlace">
        {t('nav.entrar')}
      </Link>
      <Link to="/registro" className="boton boton--pequeno">
        {t('nav.crearCuenta')}
      </Link>
    </>
  )

  return (
    <header className="cabecera">
      <div className="contenedor cabecera-fila">
        <Link to="/" className="marca" aria-label={t('nav.irInicio')}>
          Verbena<span className="marca-bombilla" aria-hidden="true" />
        </Link>

        {/* Escritorio */}
        <nav className="cabecera-nav solo-escritorio" aria-label={t('nav.principal')}>
          {listaEnlaces}
        </nav>
        <div className="cabecera-cuenta solo-escritorio">{botonesCuenta}</div>

        <BotonAjustes />

        {/* Móvil y tablet */}
        <button
          type="button"
          className="cabecera-boton solo-movil"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <IconoMenu abierto={menuAbierto} />
          {menuAbierto ? t('nav.cerrarMenu') : t('nav.menu')}
        </button>
      </div>

      {menuAbierto && (
        <div className="menu-movil solo-movil" id="menu-movil">
          <nav className="contenedor menu-movil-nav" aria-label={t('nav.principal')}>
            {listaEnlaces}
          </nav>
          <div className="contenedor menu-movil-cuenta">{botonesCuenta}</div>
          <div className="contenedor menu-movil-ajustes">
            <ControlesAjustes />
          </div>
        </div>
      )}
    </header>
  )
}
