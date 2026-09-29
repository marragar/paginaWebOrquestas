// Hook: devuelve un ref y si el elemento ya ha entrado en pantalla.
// Se usa para lanzar animaciones al hacer scroll (una sola vez).
import { useEffect, useRef, useState } from 'react'

export function useRevelar({ margen = '0px 0px -15% 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { rootMargin: margen },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [margen])

  return [ref, visible]
}
