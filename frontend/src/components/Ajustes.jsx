// Idioma y apariencia. <ControlesAjustes> son los selectores; <BotonAjustes> los abre en un
// desplegable (escritorio). En el menú del móvil se usan los controles directamente.
import { useEffect, useRef, useState } from 'react'
import { IDIOMAS, TEMAS, useTextos } from '../context/Preferencias.jsx'
import { IconoAjustes } from './Iconos.jsx'
import './Ajustes.css'

export function ControlesAjustes() {
  const { t, idioma, setIdioma, tema, setTema } = useTextos()

  return (
    <div className="ajustes-controles">
      <fieldset className="ajustes-grupo">
        <legend>{t('ajustes.idioma')}</legend>
        <div className="ajustes-opciones">
          {Object.entries(IDIOMAS).map(([codigo, { nombre }]) => (
            <button
              key={codigo}
              type="button"
              lang={codigo}
              className="ajustes-opcion"
              aria-pressed={idioma === codigo}
              onClick={() => setIdioma(codigo)}
            >
              {nombre}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="ajustes-grupo">
        <legend>{t('ajustes.apariencia')}</legend>
        <div className="ajustes-opciones">
          {TEMAS.map((valor) => (
            <button
              key={valor}
              type="button"
              className="ajustes-opcion"
              aria-pressed={tema === valor}
              onClick={() => setTema(valor)}
            >
              {t(`ajustes.${valor}`)}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export function BotonAjustes() {
  const { t, idioma } = useTextos()
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  // Cerrar al pulsar fuera o con Escape
  useEffect(() => {
    if (!abierto) return
    function fuera(e) {
      if (!caja.current?.contains(e.target)) setAbierto(false)
    }
    function tecla(e) {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [abierto])

  return (
    <div className="ajustes" ref={caja}>
      <button
        type="button"
        className="cabecera-boton"
        aria-expanded={abierto}
        aria-controls="panel-ajustes"
        onClick={() => setAbierto(!abierto)}
      >
        <IconoAjustes />
        <span className="ajustes-idioma" aria-hidden="true">{idioma.toUpperCase()}</span>
        <span className="solo-lectores">{t('ajustes.titulo')}</span>
      </button>

      {abierto && (
        <div className="ajustes-panel" id="panel-ajustes" role="dialog" aria-label={t('ajustes.titulo')}>
          <ControlesAjustes />
        </div>
      )}
    </div>
  )
}
