import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Cabecera from './components/Cabecera.jsx'
import Pie from './components/Pie.jsx'
import { useTextos } from './context/Preferencias.jsx'
import { useSesion } from './context/SesionDemo.jsx'
import Acceso from './pages/Acceso.jsx'
import FichaOrquesta from './pages/FichaOrquesta.jsx'
import Inicio from './pages/Inicio.jsx'
import Orquestas from './pages/Orquestas.jsx'
import Admin from './pages/admin/Admin.jsx'
import PanelCalendario from './pages/orquesta/PanelCalendario.jsx'
import PerfilOrquesta from './pages/orquesta/PerfilOrquesta.jsx'
import Solicitudes from './pages/orquesta/Solicitudes.jsx'
import MisReservas from './pages/usuario/MisReservas.jsx'
import PerfilUsuario from './pages/usuario/PerfilUsuario.jsx'

// Solo deja pasar si la sesión tiene el rol indicado; si no, manda a entrar
function Zona({ rol, children }) {
  const sesion = useSesion()
  const permitido = Array.isArray(rol) ? rol.includes(sesion.rol) : sesion.rol === rol
  if (!permitido) {
    return <Navigate to={rol === 'orquesta' ? '/entrar?cuenta=orquesta' : '/entrar'} replace />
  }
  return children
}

export default function App() {
  return (
    <div className="app">
      <Cabecera />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/entrar" element={<Acceso modo="entrar" />} />
          <Route path="/registro" element={<Acceso modo="registro" />} />
          <Route path="/orquestas" element={<Orquestas />} />
          <Route path="/orquestas/:id" element={<FichaOrquesta />} />

          <Route path="/mis-reservas" element={<Zona rol={['usuario', 'admin']}><MisReservas /></Zona>} />
          <Route path="/mi-perfil" element={<Zona rol={['usuario', 'admin']}><PerfilUsuario /></Zona>} />

          <Route path="/mi-orquesta" element={<Navigate to="/mi-orquesta/calendario" replace />} />
          <Route path="/mi-orquesta/calendario" element={<Zona rol="orquesta"><PanelCalendario /></Zona>} />
          <Route path="/mi-orquesta/solicitudes" element={<Zona rol="orquesta"><Solicitudes /></Zona>} />
          <Route path="/mi-orquesta/perfil" element={<Zona rol="orquesta"><PerfilOrquesta /></Zona>} />

          <Route path="/admin/*" element={<Zona rol="admin"><Admin /></Zona>} />

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <Pie />
    </div>
  )
}

function NoEncontrada() {
  const { t } = useTextos()
  return (
    <div className="contenedor pagina">
      <div className="vacio">
        <h1>{t('noEncontrada.titulo')}</h1>
        <p>{t('noEncontrada.texto')}</p>
        <Link to="/" className="boton boton--secundario">{t('noEncontrada.volver')}</Link>
      </div>
    </div>
  )
}
