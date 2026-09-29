# Schemas de disponibilidades (SPEC §3 disponibilidades, §5 Zona orquesta y §5.2).
#
# precio_final = precio de la fecha o, si es nulo, precio_base de la orquesta (SPEC §5.1).
# Calcúlalo en el router o con un @computed_field; puede ser None si faltan los dos
# (el frontend muestra «A consultar»). Precios de salida como float (ver orquesta.py).

# TODO: DisponibilidadCrearIn para POST /mi-orquesta/disponibilidad (una o varias fechas, §4.13):
#       fechas: list[date] = Field(min_length=1)
#       estado: EstadoDisponibilidad = libre   — solo se admiten "libre" o "bloqueada" (§4.12)
#       precio: Decimal | None = None
#       notas: str | None = None

# TODO: DisponibilidadUpdateIn para PATCH /mi-orquesta/disponibilidad/{id}:
#       estado (solo libre <-> bloqueada), precio, notas; todos opcionales

# TODO: DisponibilidadVariasIn para PATCH /mi-orquesta/disponibilidad (varias a la vez):
#       ids: list[int] = Field(min_length=1) y los mismos campos opcionales que DisponibilidadUpdateIn

# TODO: DisponibilidadOut — id, fecha, estado, precio, notas, precio_final
#       (GET /mi-orquesta/disponibilidad y respuestas de POST/PATCH)

# TODO: DisponibilidadLibreOut — id, fecha, precio_final, notas
#       (fechas públicas: GET /orquestas/{id}/disponibilidad y proximas_libres del listado)

# TODO: DisponibilidadConOrquestaOut para GET /disponibilidades/proximas:
#       id, fecha, precio_final, orquesta: OrquestaResumenOut
