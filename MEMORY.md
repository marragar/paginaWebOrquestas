# MEMORY.md

Memoria del proyecto entre sesiones. Maximo +-50 lineas: resume o elimina lo que ya no aporte

# Estado actual

- Monorepo FastAPI + PostgreSQL (`backend/`) y React + Vite (`frontend/`), levantado con Docker Compose.
- Backend: modelos alineados con el SPEC (Paso 1b) y migración `257765868140` aplicada; `alembic check`
  sin diferencias. Quedan los imports `backend.` de `TYPE_CHECKING` (el usuario pidió ignorarlos) y
  decidir el campo `tipo` de `Orquesta`.
- Paso 2 terminado (JWT, `core/deps.py`, 17 tests pasan sin warnings). `tests/test_security.py` prueba
  las dependencias con `db=None`; los casos con cuentas reales están apuntados en el Paso 3 del README.
  Limpieza opcional pendiente en `deps.py`: `get_current_admin` decodifica dos veces (mejor
  `Depends(get_current_usuario)`), `TODO` viejos, `userType`.
- `config.py` sin valores por defecto para `database_url` ni `jwt_secret`: llegan del `.env` vía
  Docker Compose (`DATABASE_URL` se compone en `docker-compose.yml`).
- Frontend: todas las pantallas maquetadas, en tres idiomas y con modo oscuro, pero con datos
  simulados (`datos/demo.js`) y sesión falsa (`context/SesionDemo.jsx`).
- Hay muchos cambios sin commitear en `master`.

# Decisiones y por que

- `SPEC.md` es la fuente de verdad: todo cambio se anota ahí antes de implementarse.
- Dos tablas de cuentas (`usuarios` y `orquestas`) con logins separados; el JWT lleva `sub` y `tipo`
  porque los ids pueden coincidir entre tablas. El admin es un usuario con `es_admin`.
- Errores con código estable (`error_negocio` en `core/errores.py`): la web está en es/en/gl y el
  frontend traduce el `codigo`; la API nunca devuelve textos para mostrar.
- Precios como `float` en las respuestas (el frontend espera números) y `precio_final` en toda
  disponibilidad (hoy igual a `precio`; se mantiene porque el frontend ya lo usa).
- `Disponibilidad.precio` obligatorio (decisión del usuario, contra el SPEC original), y
  `Orquesta.provincia` y `Orquesta.telefono` también obligatorios. Pendiente en SPEC §9: qué precio
  se guarda al publicar o bloquear un día sin precio, y añadir el teléfono al registro del frontend.
- Varias reservas `pendiente` por día; solo una `aceptada` (`FOR UPDATE` + índice único parcial).
  Operaciones múltiples sobre fechas: todo o nada.
- Las respuestas del backend deben tener la forma de `datos/demo.js` (SPEC §5.2) para conectar el
  frontend sin rehacer pantallas.

# Aprendizaje y errores a evitar

- Alembic autogenerate no detecta cambios de valores de enum ni índices parciales: revisar siempre
  la migración y escribir a mano los `ALTER TYPE`.
- Imports de `TYPE_CHECKING` como `app.models.…`, nunca `backend.app.models.…`.
- El usuario está aprendiendo: escribe él el código y pide revisión explicada. Si dice «no cambies
  nada», solo revisar y explicar; comprobar los fallos ejecutándolos en el contenedor antes de afirmarlos.
- En `.env`, un ` #` en la línea de un valor lo corta (comentario). Tras cambiar `.env` hay que
  recrear el contenedor (`up -d --force-recreate`); tras cambiar `requirements.txt`, `--build`.
- JWT: `sub` debe ser texto (PyJWT ≥2.10) → `str(id)` al crear, `int(...)` al leer.
- Un código de error nuevo va en `CODIGOS`, en SPEC §5.1 y en los tres `frontend/src/i18n/*.js`.
- Todo texto visible nuevo del frontend, en los tres idiomas.

# Proximos pasos

- Paso 3 del README (BD de tests, fixtures y tests de dependencias con cuentas reales).
- Decisiones abiertas en SPEC §9 (campo `tipo` de `Orquesta`, pendientes al borrar una fecha…).
