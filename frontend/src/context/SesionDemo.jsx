// TEMPORAL: simula la sesión para poder ver cada zona sin login real.
// Cuando exista AuthContext (GUIA_REACT §13), se borra este fichero y
// los componentes pasan a usar useAuth().

import { createContext, useContext, useState } from 'react'
import { orquestas, usuarios } from '../datos/demo.js'

// rol: 'visitante' | 'usuario' | 'orquesta' | 'admin'
const CUENTAS = {
  visitante: null,
  usuario: usuarios[1],
  orquesta: orquestas[0],
  admin: usuarios[4],
}

const SesionContext = createContext(null)

export function SesionDemoProvider({ children }) {
  // ?vista=orquesta en la URL abre la maqueta directamente con ese rol
  const [rol, setRol] = useState(() => {
    const vista = new URLSearchParams(window.location.search).get('vista')
    return vista in CUENTAS ? vista : 'visitante'
  })

  return (
    <SesionContext.Provider value={{ rol, setRol, cuenta: CUENTAS[rol] }}>
      {children}
    </SesionContext.Provider>
  )
}

export function useSesion() {
  return useContext(SesionContext)
}
