import { Link, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Inicio</Link>
        {/* TODO: enlaces según el tipo de cuenta (usuario, orquesta o admin) */}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          {/* TODO (SPEC §6): /login y /registro (con "Soy usuario" / "Soy orquesta"), /orquestas, /orquestas/:id,
              zona orquesta, zona usuario y zona admin (rutas protegidas por tipo de cuenta) */}
        </Routes>
      </main>
    </>
  )
}
