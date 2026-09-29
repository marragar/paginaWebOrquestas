# Schemas de reservas (SPEC §3 reservas, §5 y §5.2).
# Las formas exactas que espera el frontend están en SPEC §5.2.

# TODO: ReservaCrearIn para POST /reservas:
#       disponibilidad_id: int
#       lugar: str | None = None
#       hora_inicio: time | None = None
#       mensaje: str | None = None

# TODO: ReservaDelUsuarioOut para GET /reservas (Mis reservas):
#       id, estado, lugar, hora_inicio, mensaje, creado_en,
#       disponibilidad: {id, fecha, precio_final},
#       orquesta: {id, nombre, telefono}   — «Mis reservas» tiene botón «Llamar»

# TODO: ReservaParaOrquestaOut para GET /mi-orquesta/reservas (Solicitudes):
#       id, estado, lugar, hora_inicio, mensaje, creado_en,
#       disponibilidad: {id, fecha, estado, precio_final},
#       usuario: UsuarioResumenOut (schemas/usuario.py)

# TODO: AceptarOut para POST /mi-orquesta/reservas/{id}/aceptar:
#       reserva: ReservaParaOrquestaOut
#       rechazadas: int   — cuántas pendientes del mismo día se han rechazado (el frontend lo avisa)

# TODO: ReservaAdminOut para GET /admin/reservas:
#       id, estado, lugar, creado_en, disponibilidad: {fecha, precio_final},
#       orquesta: {id, nombre}, usuario: {id, nombre}
