from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

# TODO (SPEC §5 Auth) — dos logins separados:
#   POST /auth/usuarios/registro   — email no repetido ni en usuarios ni en orquestas (§4.11)
#                                    -> 409 "email_repetido"; password mínimo 8 caracteres
#   POST /auth/usuarios/login      — token con tipo "usuario" (también admins)
#                                    -> 401 "credenciales_incorrectas" si email o contraseña fallan
#                                       (el mismo error en los dos casos: no reveles qué email existe)
#   POST /auth/orquestas/registro  — igual, la orquesta queda con verificada=False
#   POST /auth/orquestas/login     — token con tipo "orquesta"
#   GET  /auth/me                  — {"rol": "usuario" | "orquesta" | "admin", "cuenta": {...}}
#                                    con get_current_cuenta (core/deps.py). Response model: MeOut
