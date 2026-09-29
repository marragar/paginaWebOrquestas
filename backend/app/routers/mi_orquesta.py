from fastapi import APIRouter

router = APIRouter(prefix="/mi-orquesta", tags=["zona orquesta"])

# TODO (SPEC §5 Zona orquesta) — todas con Depends(get_current_orquesta).
# Errores con app.core.errores.error_negocio (códigos en SPEC §5.1).
#
#   GET/PUT /mi-orquesta                     — PUT sin email (no se puede cambiar)
#   GET     /mi-orquesta/disponibilidad      — todas sus fechas, con estado y precio_final
#
#   POST    /mi-orquesta/disponibilidad      — una o varias fechas a la vez (DisponibilidadCrearIn):
#                                              {"fechas": [...], "estado": "libre"|"bloqueada",
#                                               "precio": opcional, "notas": opcional}
#                                              §4.1 fechas futuras -> 422 "fecha_pasada"
#                                              ya existe -> 409 "fecha_duplicada" (con fecha=...)
#                                              §4.12 bloquear un día sin fila la crea como "bloqueada"
#                                              §4.13 todo en una transacción: si una falla, ninguna
#
#   PATCH   /mi-orquesta/disponibilidad/{id} — precio, notas, bloquear/desbloquear (§4.8)
#   PATCH   /mi-orquesta/disponibilidad      — lo mismo para varias (DisponibilidadVariasIn:
#                                              {"ids": [...], "estado"?, "precio"?}), todo o nada.
#                                              Bloquear una "reservada" -> 409 "fecha_con_reserva" (§4.14)
#
#   DELETE  /mi-orquesta/disponibilidad/{id} — no si tiene reserva aceptada (§4.9) -> 409 "fecha_con_reserva"
#   DELETE  /mi-orquesta/disponibilidad?ids=1,2,3 — varias, todo o nada (§4.13)
#
#   GET     /mi-orquesta/reservas?estado=    — solicitudes recibidas, filtro de estado opcional.
#                                              Con el organizador (nombre, tipo, municipio, provincia,
#                                              telefono) y la fecha. Response: list[ReservaParaOrquestaOut]
#   POST    /mi-orquesta/reservas/{id}/aceptar — §4.4 y §4.5, todo en una transacción.
#                                              Devuelve {"reserva": ..., "rechazadas": n} (AceptarOut)
#                                              Si el índice único salta (otra se aceptó antes):
#                                              captura IntegrityError, rollback y 409 "ya_aceptada"
#   POST    /mi-orquesta/reservas/{id}/rechazar — §4.6. Solo si está "pendiente", si no 409 "estado_no_valido"
