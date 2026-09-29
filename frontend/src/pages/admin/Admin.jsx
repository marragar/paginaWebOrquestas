// Zona de administración: tres pestañas (SPEC §6)
import { useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import Estado from '../../components/Estado.jsx'
import { useFormato, useTextos } from '../../context/Preferencias.jsx'
import {
  orquestas as todasOrquestas,
  precioDe,
  reservaCompleta,
  reservas as todasReservas,
  usuarios,
} from '../../datos/demo.js'
import './Admin.css'

export default function Admin() {
  const { t } = useTextos()
  const [orquestas, setOrquestas] = useState(todasOrquestas)
  const pendientes = orquestas.filter((o) => !o.verificada)

  function verificar(id) {
    // TODO: POST /admin/orquestas/{id}/verificar
    setOrquestas(orquestas.map((o) => (o.id === id ? { ...o, verificada: true } : o)))
  }

  return (
    <div className="contenedor pagina">
      <div className="pagina-cabecera">
        <h1>{t('admin.titulo')}</h1>
      </div>

      <nav className="pestanas" aria-label={t('admin.secciones')}>
        <NavLink to="orquestas">
          {t('admin.porVerificar')}
          {pendientes.length > 0 && <span className="cabecera-aviso">{pendientes.length}</span>}
        </NavLink>
        <NavLink to="usuarios">{t('admin.usuarios')}</NavLink>
        <NavLink to="reservas">{t('admin.reservas')}</NavLink>
      </nav>

      <Routes>
        <Route index element={<Navigate to="orquestas" replace />} />
        <Route path="orquestas" element={<OrquestasPendientes pendientes={pendientes} onVerificar={verificar} />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="reservas" element={<Reservas />} />
      </Routes>
    </div>
  )
}

function OrquestasPendientes({ pendientes, onVerificar }) {
  const { t } = useTextos()

  if (pendientes.length === 0) {
    return (
      <div className="vacio">
        <p>{t('admin.sinPendientes')}</p>
      </div>
    )
  }

  return (
    <ul className="verificar">
      {pendientes.map((o) => (
        <li key={o.id} className="panel verificar-fila">
          <div>
            <h2>{o.nombre}</h2>
            <dl className="datos">
              <div><dt>{t('campos.email')}</dt><dd>{o.email}</dd></div>
              <div><dt>{t('campos.telefono')}</dt><dd>{o.telefono || t('comun.sinIndicar')}</dd></div>
              <div><dt>{t('campos.provincia')}</dt><dd>{o.provincia || t('comun.sinIndicar')}</dd></div>
              <div><dt>{t('campos.musicos')}</dt><dd>{o.num_musicos ?? t('comun.sinIndicar')}</dd></div>
            </dl>
            {o.descripcion && <p className="texto-suave verificar-descripcion">{o.descripcion}</p>}
          </div>
          <button type="button" className="boton boton--verde" onClick={() => onVerificar(o.id)}>
            {t('admin.verificar')}
          </button>
        </li>
      ))}
    </ul>
  )
}

function Usuarios() {
  const { t } = useTextos()
  const { fechaCorta } = useFormato()
  const cols = {
    nombre: t('campos.nombre'),
    tipo: t('campos.tipo'),
    email: t('campos.email'),
    municipio: t('campos.municipio'),
    provincia: t('campos.provincia'),
    alta: t('admin.alta'),
  }

  return (
    <div className="tabla-envoltorio">
      <table className="tabla tabla--apilable">
        <thead>
          <tr>
            {Object.values(cols).map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td data-etiqueta={cols.nombre}>
                <span>
                  <strong>{u.nombre}</strong>
                  {u.es_admin && <span className="admin-marca">{t('admin.marcaAdmin')}</span>}
                </span>
              </td>
              <td data-etiqueta={cols.tipo}>{t(`tipos.${u.tipo}`)}</td>
              <td data-etiqueta={cols.email} className="tabla-email">{u.email}</td>
              <td data-etiqueta={cols.municipio}>{u.municipio || '—'}</td>
              <td data-etiqueta={cols.provincia}>{u.provincia || '—'}</td>
              <td data-etiqueta={cols.alta}>{fechaCorta(u.creado_en)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ESTADOS = ['todas', 'pendiente', 'aceptada', 'rechazada', 'cancelada']

function Reservas() {
  const { t } = useTextos()
  const { euros, fechaCorta } = useFormato()
  const [filtro, setFiltro] = useState('todas')
  const reservas = todasReservas
    .map(reservaCompleta)
    .filter((r) => filtro === 'todas' || r.estado === filtro)
    .sort((a, b) => a.disponibilidad.fecha.localeCompare(b.disponibilidad.fecha))
  const cols = {
    fecha: t('admin.fecha'),
    orquesta: t('admin.orquesta'),
    organizador: t('admin.organizador'),
    lugar: t('campos.lugar'),
    precio: t('campos.precio'),
    estado: t('admin.estado'),
  }

  return (
    <>
      <div className="filtros" role="group" aria-label={t('reservas.filtrar')}>
        {ESTADOS.map((e) => (
          <button key={e} type="button" className="filtro" aria-pressed={filtro === e} onClick={() => setFiltro(e)}>
            {e === 'todas' ? t('reservas.todas') : t(`reservas.filtro.${e}`)}
          </button>
        ))}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla tabla--apilable">
          <thead>
            <tr>
              {Object.entries(cols).map(([clave, c]) => (
                <th key={clave} className={clave === 'precio' ? 'num' : undefined}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id}>
                <td data-etiqueta={cols.fecha}>{fechaCorta(r.disponibilidad.fecha)}</td>
                <td data-etiqueta={cols.orquesta}>{r.orquesta.nombre}</td>
                <td data-etiqueta={cols.organizador}>{r.usuario.nombre}</td>
                <td data-etiqueta={cols.lugar}>{r.lugar || '—'}</td>
                <td data-etiqueta={cols.precio} className="num">{euros(precioDe(r.disponibilidad, r.orquesta))}</td>
                <td data-etiqueta={cols.estado}><span><Estado estado={r.estado} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
