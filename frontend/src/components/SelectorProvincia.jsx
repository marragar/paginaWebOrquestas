import { useTextos } from '../context/Preferencias.jsx'
import { PROVINCIAS } from '../datos/demo.js'

// Desplegable de provincias con la opción "Sin indicar"
export default function SelectorProvincia({ id, defaultValue = '' }) {
  const { t } = useTextos()
  return (
    <select id={id} defaultValue={defaultValue}>
      <option value="">{t('comun.sinIndicar')}</option>
      {PROVINCIAS.map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>
  )
}
