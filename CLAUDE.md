# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Memoria del proyecto entre sesiones (estado, decisiones, próximos pasos): @MEMORY.md — mantenla al día al terminar cada tarea.

## Proyecto

Plataforma (MVP) para que organizadores de fiestas (ayuntamientos, juntas vecinales, comisiones…) reserven fechas de orquestas. Todo el código, los comentarios y los nombres están en **español**; mantenlo así.

- **`SPEC.md` es la fuente de verdad** (modelo de datos §3, reglas de negocio §4, API §5, convenciones §5.1, forma de las respuestas §5.2, pantallas §6, decisiones abiertas §9). Cualquier funcionalidad o cambio de comportamiento se anota primero en el SPEC.
- `README.md` contiene una guía de desarrollo paso a paso (pasos 0–12) con casillas; indica qué está hecho y qué falta. Muchos ficheros tienen comentarios `TODO` que remiten a esos pasos.
- `frontend/GUIA_REACT.md`: guía de React para el frontend.

## Comandos

Todo corre en Docker Compose (servicios `db` = Postgres 16, `backend`, `frontend`). Hace falta un `.env` (copiado de `.env.example`).

```bash
docker compose up --build                     # frontend :5173, backend :8000 (/docs, /api/health)

docker compose exec backend pytest            # todos los tests
docker compose exec backend pytest tests/test_security.py::nombre_test   # un solo test

docker compose exec backend alembic revision --autogenerate -m "descripcion"
docker compose exec backend alembic upgrade head

docker compose exec backend python -m scripts.crear_admin admin@ejemplo.com secreto "Administrador"
docker compose exec db psql -U orquestas -d orquestas      # inspeccionar la BD
```

Frontend (Vite, sin linter ni tests configurados): `npm run dev`, `npm run build` dentro de `frontend/`.

## Arquitectura

**Backend** (FastAPI + SQLAlchemy 2 + Alembic, `backend/app/`):
- `main.py` registra un router por bloque de la API, todos con prefijo `/api`.
- **Dos tablas de cuentas separadas** (`usuarios` y `orquestas`), cada una con su registro/login. El admin es un `Usuario` con `es_admin`. Como los ids pueden coincidir entre tablas, el JWT lleva `sub` **y** `tipo` (`TipoCuenta` en `core/security.py`). Las dependencias `get_current_usuario / _orquesta / _admin / _cuenta` viven en `core/deps.py`. Un email no puede repetirse entre las dos tablas.
- **Errores de negocio**: siempre con `error_negocio(status, codigo, mensaje, **extra)` de `core/errores.py` → `{"detail": {"codigo", "mensaje", ...}}`. El frontend traduce el `codigo`. Un código nuevo debe añadirse en `CODIGOS`, en SPEC §5.1 y en los tres ficheros `frontend/src/i18n/*.js` (sección `errores`). Los tests comprueban el `codigo`, no el texto.
- La API nunca devuelve textos para mostrar: enums por su valor, fechas ISO. Precios como `float` en los schemas de salida (Pydantic v2 serializa `Decimal` como string). Toda disponibilidad devuelta lleva `precio_final` (hoy igual a `precio`, que es obligatorio). Nunca devolver `password_hash`.
- Los modelos usan `Mapped[...]` y enums con `values_callable` para guardar el valor (`junta_vecinal`), no el nombre; `usuario.py` es el modelo de referencia. Los imports de `TYPE_CHECKING` van como `app.models.…` (sin `backend.`). Los modelos deben importarse en `models/__init__.py` para que Alembic los vea.
- **Alembic autogenerate no detecta cambios de valores de enum ni índices parciales**: revisa siempre la migración generada y escribe a mano los `ALTER TYPE`.
- Reglas clave de reservas (SPEC §4): aceptar una reserva es una única transacción con `SELECT … FOR UPDATE` sobre la disponibilidad (reserva → `aceptada`, disponibilidad → `reservada`, resto de pendientes de ese día → `rechazada`), respaldada por un índice único parcial (`estado = 'aceptada'`). Las operaciones múltiples sobre `/mi-orquesta/disponibilidad` son todo o nada.

**Frontend** (React 19 + Vite + react-router 7, `frontend/src/`):
- Vite hace proxy de `/api` al backend (`API_URL`); `api/client.js` envuelve `fetch`.
- Las pantallas están maquetadas pero funcionan con **datos simulados**: `datos/demo.js` y `context/SesionDemo.jsx` (sesión falsa con selector de rol en el pie). El plan (README pasos 9–11) es sustituirlos por la API real y un `AuthContext` con la misma forma `{ rol, cuenta }`, sin rehacer pantallas. Las respuestas del backend deben coincidir con la forma de `demo.js` (SPEC §5.2).
- `App.jsx` protege las rutas por rol con el componente `Zona` (`usuario`, `orquesta`, `admin`).
- i18n en español, inglés y gallego (`i18n/`, `useTextos()` → `t(...)` en `context/Preferencias.jsx`), además de tema claro/oscuro. Cualquier texto visible nuevo debe ir en los tres idiomas.
