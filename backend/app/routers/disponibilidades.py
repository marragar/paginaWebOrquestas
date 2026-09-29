from fastapi import APIRouter

router = APIRouter(prefix="/disponibilidades", tags=["orquestas"])

# TODO (SPEC §5 Orquestas, nuevo) — público, sin login:
#   GET /disponibilidades/proximas?limite=6
#       Fechas "libre", futuras (>= hoy), de orquestas verificadas (§4.10), ordenadas por fecha.
#       Cada una con precio_final y la orquesta resumida (id, nombre, provincia, num_musicos).
#       Response model: list[DisponibilidadConOrquestaOut] (schemas/disponibilidad.py).
#       Pista: join con Orquesta y .limit(limite); limite con Query(6, ge=1, le=20).
