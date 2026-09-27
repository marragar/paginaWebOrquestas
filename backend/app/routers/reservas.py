from fastapi import APIRouter

router = APIRouter(tags=["zona usuario"])

# TODO (SPEC §5 Zona usuario) — todas con Depends(get_current_usuario):
#   GET/PUT /mi-perfil
#   POST    /reservas               — §4.1, §4.2, §4.3
#   GET     /reservas
#   POST    /reservas/{id}/cancelar — §4.7
