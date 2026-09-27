from fastapi import APIRouter

router = APIRouter(prefix="/mi-orquesta", tags=["zona orquesta"])

# TODO (SPEC §5 Zona orquesta) — todas con Depends(get_current_orquesta):
#   GET/PUT /mi-orquesta
#   GET     /mi-orquesta/disponibilidad
#   POST    /mi-orquesta/disponibilidad          — solo fechas futuras (§4.1)
#   PATCH   /mi-orquesta/disponibilidad/{id}     — precio, notas, bloquear/desbloquear (§4.8)
#   DELETE  /mi-orquesta/disponibilidad/{id}     — no si tiene reserva aceptada (§4.9)
#   GET     /mi-orquesta/reservas
#   POST    /mi-orquesta/reservas/{id}/aceptar   — §4.4 y §4.5, todo en una transacción
#   POST    /mi-orquesta/reservas/{id}/rechazar  — §4.6
