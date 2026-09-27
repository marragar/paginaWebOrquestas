from fastapi import APIRouter

router = APIRouter(prefix="/orquestas", tags=["orquestas"])

# TODO (SPEC §5 Orquestas) — públicas, sin login:
#   GET /orquestas                        — solo verificadas (§4.10); filtros: provincia, fecha libre
#   GET /orquestas/{id}
#   GET /orquestas/{id}/disponibilidad?desde=&hasta=   — solo "libre" y futuras
