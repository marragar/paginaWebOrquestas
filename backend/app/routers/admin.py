from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])

# TODO (SPEC §5 Admin) — todas requieren rol ADMIN:
#   GET   /admin/orquestas?validada=false
#   POST  /admin/orquestas/{id}/validar
#   GET   /admin/usuarios
#   PATCH /admin/usuarios/{id}      — activar/desactivar
#   GET   /admin/reservas
