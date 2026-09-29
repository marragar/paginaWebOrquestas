// Datos de ejemplo para maquetar las pantallas sin backend.
// Tienen la misma forma que los modelos de SPEC §3; cuando se conecte la API,
// cada página sustituirá estos imports por llamadas con api().

export const PROVINCIAS = [
  'A Coruña', 'Asturias', 'Burgos', 'Cantabria', 'León', 'Lugo',
  'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Valladolid', 'Zamora',
]

export const orquestas = [
  {
    id: 1,
    nombre: 'Orquesta Cinco Estrellas',
    descripcion:
      'Veinte años recorriendo plazas del noroeste. Repertorio de pasodobles para la sobremesa, pop de los 80 y 90 para la verbena y sesión de éxitos actuales para cerrar la noche. Escenario propio de 12 metros.',
    provincia: 'León',
    num_musicos: 14,
    precio_base: 6500,
    telefono: '987 123 456',
    email: 'contratacion@cincoestrellas.es',
    verificada: true,
  },
  {
    id: 2,
    nombre: 'La Gran Parranda',
    descripcion:
      'Orquesta joven con cuerpo de baile y dos cantantes. Pensada para fiestas patronales con público de todas las edades.',
    provincia: 'Lugo',
    num_musicos: 11,
    precio_base: 4800,
    telefono: '982 555 010',
    email: 'hola@granparranda.com',
    verificada: true,
  },
  {
    id: 3,
    nombre: 'Trío Alborada',
    descripcion:
      'Formato reducido para verbenas pequeñas, bodas y fiestas de barrio. Sonido y luces incluidos.',
    provincia: 'Zamora',
    num_musicos: 3,
    precio_base: 1200,
    telefono: '980 300 200',
    email: 'trioalborada@gmail.com',
    verificada: true,
  },
  {
    id: 4,
    nombre: 'Orquesta Nova Galicia',
    descripcion:
      'Espectáculo de tres horas con cambios de vestuario, pantallas LED y banda de metales.',
    provincia: 'Pontevedra',
    num_musicos: 18,
    precio_base: 9800,
    telefono: '986 777 888',
    email: 'booking@novagalicia.gal',
    verificada: true,
  },
  {
    id: 5,
    nombre: 'Los Del Páramo',
    descripcion: 'Música tradicional y de baile para romerías y fiestas de pueblo.',
    provincia: 'Palencia',
    num_musicos: 6,
    precio_base: 2300,
    telefono: '979 111 222',
    email: 'losdelparamo@correo.es',
    verificada: false,
  },
  {
    id: 6,
    nombre: 'Orquesta Tentación',
    descripcion: 'Versiones de rock, pop y latino. Doce músicos y técnico de sonido propio.',
    provincia: 'Burgos',
    num_musicos: 12,
    precio_base: 5400,
    telefono: '947 222 333',
    email: 'info@orquestatentacion.es',
    verificada: false,
  },
]

// Una fila por orquesta y día (SPEC §3 disponibilidades)
export const disponibilidades = [
  { id: 101, orquesta_id: 1, fecha: '2026-10-10', estado: 'libre', precio: null, notas: '' },
  { id: 102, orquesta_id: 1, fecha: '2026-10-11', estado: 'reservada', precio: null, notas: '' },
  { id: 103, orquesta_id: 1, fecha: '2026-10-12', estado: 'libre', precio: 7200, notas: 'Festivo nacional' },
  { id: 104, orquesta_id: 1, fecha: '2026-10-17', estado: 'bloqueada', precio: null, notas: 'Revisión del escenario' },
  { id: 105, orquesta_id: 1, fecha: '2026-10-24', estado: 'libre', precio: null, notas: '' },
  { id: 106, orquesta_id: 1, fecha: '2026-10-31', estado: 'libre', precio: 7000, notas: 'Noche de difuntos' },
  { id: 107, orquesta_id: 1, fecha: '2026-11-07', estado: 'libre', precio: null, notas: '' },
  { id: 108, orquesta_id: 1, fecha: '2026-11-14', estado: 'reservada', precio: null, notas: '' },
  { id: 109, orquesta_id: 1, fecha: '2026-12-31', estado: 'libre', precio: 12000, notas: 'Nochevieja' },
  { id: 201, orquesta_id: 2, fecha: '2026-10-10', estado: 'libre', precio: null, notas: '' },
  { id: 202, orquesta_id: 2, fecha: '2026-10-18', estado: 'libre', precio: null, notas: '' },
  { id: 203, orquesta_id: 2, fecha: '2026-10-25', estado: 'reservada', precio: null, notas: '' },
  { id: 301, orquesta_id: 3, fecha: '2026-10-03', estado: 'libre', precio: null, notas: '' },
  { id: 302, orquesta_id: 3, fecha: '2026-10-04', estado: 'libre', precio: null, notas: '' },
  { id: 303, orquesta_id: 3, fecha: '2026-11-01', estado: 'libre', precio: null, notas: '' },
  { id: 401, orquesta_id: 4, fecha: '2026-10-31', estado: 'libre', precio: null, notas: '' },
]

export const usuarios = [
  { id: 1, email: 'fiestas@ayto-astorga.es', nombre: 'Ayuntamiento de Astorga', tipo: 'ayuntamiento', cif: 'P2400800A', municipio: 'Astorga', provincia: 'León', telefono: '987 618 850', es_admin: false, creado_en: '2026-03-02' },
  { id: 2, email: 'juntavecinal.quintana@gmail.com', nombre: 'Junta Vecinal de Quintana', tipo: 'junta_vecinal', cif: '', municipio: 'Quintana del Castillo', provincia: 'León', telefono: '', es_admin: false, creado_en: '2026-04-18' },
  { id: 3, email: 'comision.sanroque@hotmail.com', nombre: 'Comisión de Fiestas San Roque', tipo: 'comision_fiestas', cif: 'G24555111', municipio: 'Villablino', provincia: 'León', telefono: '600 111 222', es_admin: false, creado_en: '2026-05-27' },
  { id: 4, email: 'lucia.fdez@gmail.com', nombre: 'Lucía Fernández', tipo: 'particular', cif: '', municipio: 'Ponferrada', provincia: 'León', telefono: '655 000 111', es_admin: false, creado_en: '2026-08-09' },
  { id: 5, email: 'admin@verbena.es', nombre: 'Administración', tipo: 'particular', cif: '', municipio: '', provincia: '', telefono: '', es_admin: true, creado_en: '2026-01-10' },
]

export const reservas = [
  { id: 1, disponibilidad_id: 101, usuario_id: 1, estado: 'pendiente', lugar: 'Plaza Mayor de Astorga', hora_inicio: '23:00', mensaje: 'Fiestas de otoño. Necesitaríamos sesión de vermú a las 13:00 también, ¿es posible?', creado_en: '2026-09-20' },
  { id: 2, disponibilidad_id: 101, usuario_id: 3, estado: 'pendiente', lugar: 'Campo de la fiesta, Villablino', hora_inicio: '22:30', mensaje: '', creado_en: '2026-09-24' },
  { id: 3, disponibilidad_id: 102, usuario_id: 2, estado: 'aceptada', lugar: 'Pabellón municipal', hora_inicio: '00:00', mensaje: 'Si llueve se hace dentro del pabellón.', creado_en: '2026-08-30' },
  { id: 4, disponibilidad_id: 108, usuario_id: 1, estado: 'aceptada', lugar: 'Plaza Mayor de Astorga', hora_inicio: '22:00', mensaje: '', creado_en: '2026-09-01' },
  { id: 5, disponibilidad_id: 105, usuario_id: 4, estado: 'rechazada', lugar: 'Finca Los Robles', hora_inicio: '21:00', mensaje: 'Es para una boda.', creado_en: '2026-09-10' },
  { id: 6, disponibilidad_id: 201, usuario_id: 2, estado: 'pendiente', lugar: 'Plaza de la iglesia', hora_inicio: '23:30', mensaje: '', creado_en: '2026-09-26' },
  { id: 7, disponibilidad_id: 203, usuario_id: 2, estado: 'cancelada', lugar: 'Plaza de la iglesia', hora_inicio: '23:00', mensaje: '', creado_en: '2026-07-15' },
  { id: 8, disponibilidad_id: 109, usuario_id: 2, estado: 'pendiente', lugar: 'Pabellón municipal', hora_inicio: '00:30', mensaje: 'Cotillón de fin de año.', creado_en: '2026-09-27' },
]

// ---------- Ayudas para las pantallas ----------

export function orquestaPorId(id) {
  return orquestas.find((o) => o.id === Number(id))
}

export function disponibilidadesDe(orquestaId) {
  return disponibilidades.filter((d) => d.orquesta_id === Number(orquestaId))
}

// Reserva con su disponibilidad, orquesta y usuario ya resueltos
export function reservaCompleta(reserva) {
  const disponibilidad = disponibilidades.find((d) => d.id === reserva.disponibilidad_id)
  return {
    ...reserva,
    disponibilidad,
    orquesta: orquestaPorId(disponibilidad.orquesta_id),
    usuario: usuarios.find((u) => u.id === reserva.usuario_id),
  }
}

export function precioDe(disponibilidad, orquesta) {
  return disponibilidad.precio ?? orquesta.precio_base
}
