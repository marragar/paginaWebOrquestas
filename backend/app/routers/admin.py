from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])

# TODO (SPEC §5 Admin) — todas con Depends(get_current_admin):
#   GET   /admin/orquestas?verificada=false
#   POST  /admin/orquestas/{id}/verificar
#   GET   /admin/usuarios
#   GET   /admin/reservas
