from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

# TODO (SPEC §5 Auth):
#   POST /auth/registro  — crea usuario + perfil según rol (solo ORQUESTA o USUARIO)
#   POST /auth/login     — devuelve token
#   GET  /auth/me        — datos del usuario autenticado
