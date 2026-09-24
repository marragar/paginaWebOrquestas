from fastapi import APIRouter

router = APIRouter(prefix="/orquestas", tags=["orquestas"])

# TODO (SPEC §5 Orquestas):
#   GET /orquestas                        — solo validadas y activas (filtros: provincia, fecha libre)
#   GET /orquestas/{id}
#   GET /orquestas/{id}/disponibilidad?desde=&hasta=
