// Formateo de fechas y dinero según el idioma elegido.
// En los componentes se usa a través de useFormato() (context/Preferencias.jsx),
// que ya pasa el locale correcto.

// Las fechas vienen como 'AAAA-MM-DD'; se crean a mediodía para evitar saltos por zona horaria
export function aFecha(texto) {
  return new Date(`${texto}T12:00:00`)
}

export function aTexto(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${m}-${d}`
}

export function fechaLarga(texto, locale) {
  return aFecha(texto).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function fechaCorta(texto, locale) {
  return aFecha(texto).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function mesCorto(texto, locale) {
  return aFecha(texto).toLocaleDateString(locale, { month: 'short' }).replace('.', '')
}

export function semanaCorta(texto, locale) {
  return aFecha(texto).toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')
}

export function mesYAnio(fecha, locale) {
  return fecha.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export function diaSemanaLargo(fecha, locale) {
  return fecha.toLocaleDateString(locale, { weekday: 'long' })
}

// Devuelve null si no hay cantidad, para que la pantalla ponga su propio texto ("A consultar").
// Intl ya sigue la norma de cada idioma: en español y gallego las cifras de cuatro dígitos
// van sin separador (6500 €, como indica la RAE); en inglés, €6,500.
export function euros(cantidad, locale) {
  if (cantidad == null) return null
  return cantidad.toLocaleString(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}
