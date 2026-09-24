import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export default function Inicio() {
  const [estado, setEstado] = useState('comprobando...')

  // Comprobación de que el frontend llega al backend; bórralo cuando ya no haga falta
  useEffect(() => {
    api('/health')
      .then((data) => setEstado(data.status))
      .catch((err) => setEstado(`error: ${err.message}`))
  }, [])

  return (
    <>
      <h1>Plataforma de orquestas</h1>
      <p>Backend: {estado}</p>
    </>
  )
}
