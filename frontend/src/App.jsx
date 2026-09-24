import { Link, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Inicio</Link>
        {/* TODO: enlaces según el rol del usuario autenticado */}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          {/* TODO (SPEC §6): /login, /registro, /orquestas, /orquestas/:id,
              zona orquesta, zona usuario y zona admin (rutas protegidas por rol) */}
        </Routes>
      </main>
    </>
  )
}
