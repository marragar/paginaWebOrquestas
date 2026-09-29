# Schemas de orquestas (SPEC §3 orquestas, §5 y §5.2).
#
# Precios: en la BD son Numeric(10, 2) (Decimal), pero en JSON deben salir como número.
# Pydantic v2 serializa Decimal como texto ("6500.00"), así que en los schemas de SALIDA
# decláralos como float:  precio_base: float | None
# En los de ENTRADA puedes usar Decimal con Field(ge=0).

# TODO: OrquestaRegistroIn — email, password (min 8), nombre, provincia, num_musicos (opcionales
#       según §3). Nunca "verificada": la pone un admin.

# TODO: OrquestaUpdateIn para PUT /mi-orquesta — nombre, descripcion, provincia, num_musicos,
#       precio_base, telefono. Sin email ni verificada.

# TODO: OrquestaPrivadaOut — lo que ve la propia orquesta y el admin: todos los campos de §3
#       menos password_hash (incluye email y verificada).

# TODO: OrquestaPublicaOut para GET /orquestas/{id} — id, nombre, descripcion, provincia,
#       num_musicos, precio_base, telefono. Sin email ni verificada.

# TODO: OrquestaListaOut para GET /orquestas — lo de OrquestaPublicaOut más
#       proximas_libres: list[DisponibilidadLibreOut] (máximo 5, ver disponibilidad.py)

# TODO: OrquestaResumenOut — para anidar dentro de otras respuestas:
#       id, nombre, provincia, num_musicos, telefono
