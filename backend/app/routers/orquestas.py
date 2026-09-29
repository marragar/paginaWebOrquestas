from fastapi import APIRouter

router = APIRouter(prefix="/orquestas", tags=["orquestas"])

# TODO (SPEC §5 Orquestas) — públicas, sin login:
#   GET /orquestas                        — solo verificadas (§4.10); filtros: provincia, fecha libre
#                                           Cada orquesta con "proximas_libres": sus 5 próximas fechas
#                                           libres (id, fecha, precio_final). Response: list[OrquestaListaOut]
#                                           Ojo con el N+1: carga las fechas de todas las orquestas en
#                                           una sola consulta (selectinload o una query aparte agrupando).
#   GET /orquestas/{id}                   — 404 "no_encontrado" si no existe o no está verificada
#                                           Incluye telefono (la ficha tiene botón «Llamar»),
#                                           nunca email ni password_hash. Response: OrquestaPublicaOut
#   GET /orquestas/{id}/disponibilidad?desde=&hasta=   — solo "libre" y futuras, con precio_final
