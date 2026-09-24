from fastapi import APIRouter

router = APIRouter(prefix="/mi-orquesta", tags=["zona orquesta"])

# TODO (SPEC §5 Zona orquesta) — todas requieren rol ORQUESTA:
#   GET/PUT /mi-orquesta
#   GET     /mi-orquesta/disponibilidad
#   POST    /mi-orquesta/disponibilidad          — solo fechas futuras (§4.1)
#   DELETE  /mi-orquesta/disponibilidad/{id}     — no si tiene reserva activa (§4.6)
#   GET     /mi-orquesta/reservas
#   POST    /mi-orquesta/reservas/{id}/aceptar   — §4.4
#   POST    /mi-orquesta/reservas/{id}/rechazar  — §4.5
