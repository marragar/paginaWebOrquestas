from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])

# TODO (SPEC §5 Admin) — todas con Depends(get_current_admin):
#   GET   /admin/orquestas?verificada=false — con email y teléfono (el admin los necesita para verificar)
#   POST  /admin/orquestas/{id}/verificar
#   GET   /admin/usuarios                   — UsuarioOut (incluye es_admin y creado_en)
#   GET   /admin/reservas?estado=           — todas, con fecha, orquesta, organizador y precio_final
