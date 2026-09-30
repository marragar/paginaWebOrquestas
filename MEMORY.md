# MEMORY.md

Memoria del proyecto entre sesiones. Maximo +-50 lineas: resume o elimina lo que ya no aporte

# Estado actual

- Pasos 0–3 del README terminados. Migraciones aplicadas hasta `383a6889d364` (estado `retirada`);
  `alembic check` sin diferencias. Pendiente del 1b: imports `backend.` de `TYPE_CHECKING` (el
  usuario pidió ignorarlos) y decidir el campo `tipo` de `Orquesta`.
- Tests: BD `orquestas_test` (creada a mano con `createdb`; `create_all` + rollback por test con
  `join_transaction_mode="create_savepoint"`). Ayudantes en `conftest.py` (`crear_usuario`,
  `crear_orquesta`, `crear_disponibilidad`, `crear_reserva`, `headers_de`), `assert_error` en
  `tests/utilidades.py`. 74 tests en ~2 s (el hash de la contraseña de tests se calcula una vez).
- `config.py` sin valores por defecto para `database_url` ni `jwt_secret`: llegan del `.env` vía
  Docker Compose (`DATABASE_URL` se compone en `docker-compose.yml`).
- Limpieza opcional pendiente: `get_current_admin` decodifica dos veces, imports repetidos y `TODO`
  viejos en `conftest.py` y `deps.py`.
- Frontend maquetado con datos simulados (`datos/demo.js`, `context/SesionDemo.jsx`).
- Hay muchos cambios sin commitear en `master`.

# Decisiones y por que

- `Disponibilidad.precio`, `Orquesta.provincia` y `Orquesta.telefono` obligatorios (decisión del
  usuario). Pendiente en SPEC §9: qué precio se guarda al publicar o bloquear un día sin precio, y
  añadir el teléfono al registro de orquesta del frontend.
- Fechas: borrado lógico (elegido por el usuario frente a borrar en cascada). El DELETE de la API
  pasa la fecha a `retirada` (estado del enum, no una columna bool: los listados públicos ya filtran
  `libre` y no hay combinaciones inválidas). Prohibido si está `reservada` (409); pendientes →
  `rechazada`; publicar ese día reutiliza la fila (SPEC §4.9 y §4.15). `passive_deletes=True` en las
  `relationship()` para que borrar cuentas deje actuar al `ON DELETE CASCADE`.
- Bloquear una fecha también pasa sus pendientes a `rechazada` (§4.8, opción elegida por el usuario
  frente a impedir el bloqueo); desbloquear no las recupera.
- Contraseñas: tipo `Password` en `schemas/auth.py` (8 caracteres mín., 72 bytes máx., límite de
  bcrypt 5, que lanza `ValueError` si se pasa) para los registros; `verify_password` devuelve False
  con más de 72 bytes para que el login no dé 500.
- `precio_final` en toda disponibilidad (hoy igual a `precio`; se mantiene porque el frontend lo usa).

# Aprendizaje y errores a evitar

- El usuario está aprendiendo: escribe él el código y pide revisión explicada. Si dice «no cambies
  nada», solo revisar y explicar; comprobar los fallos ejecutándolos en el contenedor antes de afirmarlos.
  Le ayudan las explicaciones con código completo comentado más que las descripciones por partes.
- En `.env`, un ` #` en la línea de un valor lo corta (comentario). Tras cambiar `.env` hay que
  recrear el contenedor (`up -d --force-recreate`); tras cambiar `requirements.txt`, `--build`.
- JWT: `sub` debe ser texto (PyJWT ≥2.10) → `str(id)` al crear, `int(...)` al leer.
- `18 passed` no prueba nada de un ayudante que ningún test usa: cada ayudante tiene su test en
  `tests/test_bd.py`.

# Proximos pasos

- Paso 4 del README (schemas con `Password`, registro, login, `/auth/me`, `crear_admin`).
- Decisiones abiertas en SPEC §9 (campo `tipo` de `Orquesta`, precio al publicar sin precio…).
