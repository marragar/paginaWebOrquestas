from fastapi import APIRouter

router = APIRouter(tags=["zona usuario"])

# TODO (SPEC §5 Zona usuario) — todas requieren rol USUARIO:
#   GET/PUT /mi-perfil
#   POST    /reservas               — §4.1, §4.2, §4.3, §4.8
#   GET     /reservas
#   POST    /reservas/{id}/cancelar — §4.5
