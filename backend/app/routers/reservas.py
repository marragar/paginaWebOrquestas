from fastapi import APIRouter

router = APIRouter(tags=["zona usuario"])

# TODO (SPEC §5 Zona usuario) — todas con Depends(get_current_usuario).
# Errores con app.core.errores.error_negocio (códigos en SPEC §5.1).
#
#   GET/PUT /mi-perfil              — PUT sin email ni es_admin (UsuarioUpdateIn)
#   POST    /reservas               — ReservaCrearIn: disponibilidad_id, lugar, hora_inicio, mensaje
#                                     §4.1 -> 422 "fecha_pasada"
#                                     §4.2 y §4.8 -> 409 "fecha_no_libre"
#                                     §4.3 -> 409 "solicitud_duplicada"
#   GET     /reservas?estado=       — mis solicitudes, filtro de estado opcional, ordenadas por fecha.
#                                     Con la fecha, precio_final y la orquesta (id, nombre, telefono).
#                                     Response: list[ReservaDelUsuarioOut]
#   POST    /reservas/{id}/cancelar — §4.7. Solo "pendiente" o "aceptada", si no 409 "estado_no_valido".
#                                     Si era "aceptada", la disponibilidad vuelve a "libre".
