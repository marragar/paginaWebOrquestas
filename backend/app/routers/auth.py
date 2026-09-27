from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

# TODO (SPEC §5 Auth) — dos logins separados:
#   POST /auth/usuarios/registro   — email no repetido ni en usuarios ni en orquestas (§4.11)
#   POST /auth/usuarios/login      — token con tipo "usuario" (también admins)
#   POST /auth/orquestas/registro  — igual, la orquesta queda con verificada=False
#   POST /auth/orquestas/login     — token con tipo "orquesta"
#   GET  /auth/me                  — devuelve el usuario o la orquesta según el tipo del token
