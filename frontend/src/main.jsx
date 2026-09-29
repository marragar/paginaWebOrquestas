import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Los estilos globales van antes que los de los componentes para que estos puedan sobrescribirlos
import './index.css'
import App from './App.jsx'
import { PreferenciasProvider } from './context/Preferencias.jsx'
import { SesionDemoProvider } from './context/SesionDemo.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PreferenciasProvider>
        <SesionDemoProvider>
          <App />
        </SesionDemoProvider>
      </PreferenciasProvider>
    </BrowserRouter>
  </StrictMode>,
)
