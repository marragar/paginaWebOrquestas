# Plataforma de orquestas

Especificación completa en [SPEC.md](SPEC.md).
Guía de React para el frontend en [frontend/GUIA_REACT.md](frontend/GUIA_REACT.md).

## Arrancar

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend (docs interactivas): http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

## Comandos útiles

```bash
# Migraciones (tras crear/modificar modelos)
docker compose exec backend alembic revision --autogenerate -m "descripcion"
docker compose exec backend alembic upgrade head

# Tests
docker compose exec backend pytest

# Crear un admin
docker compose exec backend python -m scripts.crear_admin admin@ejemplo.com secreto
```

## Estructura

```
backend/
  app/
    main.py          # app FastAPI + registro de routers
    config.py        # configuración (variables de entorno)
    database.py      # engine, sesión, Base, get_db
    core/            # seguridad (hash, JWT) y dependencias (usuario actual, roles)
    models/          # modelos SQLAlchemy (usuario.py es el ejemplo de referencia)
    schemas/         # modelos Pydantic de entrada/salida
    routers/         # un fichero por bloque de la API (SPEC §5)
  alembic/           # migraciones
  scripts/           # comandos sueltos (crear admin)
  tests/
frontend/
  src/
    api/client.js    # fetch hacia /api
    pages/           # una página por pantalla (SPEC §6)
    components/
```

## Guía de desarrollo paso a paso

Cada paso indica **qué hacer**, **dónde** y **cómo comprobar que funciona** antes de pasar al
siguiente. Marca las casillas conforme avances. Si algo del SPEC cambia por el camino, actualiza
primero `SPEC.md`.

---

### Paso 0 — Poner en marcha la plantilla

1. [ ] Copia `.env.example` a `.env` (si no existe ya) y cambia `JWT_SECRET`.
2. [ ] Arranca Docker Desktop y ejecuta `docker compose up --build`.
3. [ ] Comprueba:
   - http://localhost:8000/api/health devuelve `{"status": "ok"}`
   - http://localhost:5173 muestra "Backend: ok"
   - `docker compose exec backend pytest` pasa.
4. [ ] Haz el primer commit con la plantilla.

---

### Paso 1 — Modelos de datos y primera migración

**Objetivo:** que todas las tablas de SPEC §3 existan en PostgreSQL.

1. [ ] Lee `backend/app/models/usuario.py`: es el modelo de referencia (tipos con `Mapped[...]`,
       enums con `enum.Enum`, `server_default=func.now()` para fechas de creación).
2. [ ] Escribe los modelos que faltan, uno por fichero:
   - [ ] `perfil_orquesta.py` — FK a `usuario.id` con `unique=True` (relación 1:1), `validada=False` por defecto.
   - [ ] `perfil_contratante.py` — igual que el anterior, con el enum `TipoEntidad`.
   - [ ] `disponibilidad.py` — enum `EstadoDisponibilidad` y `UniqueConstraint("orquesta_id", "fecha")`.
   - [ ] `reserva.py` — enum `EstadoReserva`, `hora_aproximada` y `notas` opcionales
         (`Mapped[... | None]`), `actualizado_en` con `onupdate=func.now()`.
3. [ ] Añade las `relationship()` que vayas a necesitar (usuario ↔ perfil, orquesta → disponibilidades,
       disponibilidad → reservas...).
4. [ ] Descomenta los imports en `models/__init__.py` (si no, Alembic no ve los modelos).
5. [ ] Regla §4.8 (dos solicitudes simultáneas): añade en `Reserva` un índice único **parcial**
       sobre `disponibilidad_id` para los estados `PENDIENTE` y `ACEPTADA`
       (`Index(..., unique=True, postgresql_where=...)`).
6. [ ] Genera y aplica la migración:
   ```bash
   docker compose exec backend alembic revision --autogenerate -m "modelos iniciales"
   docker compose exec backend alembic upgrade head
   ```
7. [ ] **Revisa el fichero generado** en `alembic/versions/`: autogenerate a veces no detecta
       bien los enums o los índices parciales.

**Comprobación:** `docker compose exec db psql -U orquestas -d orquestas -c "\d reserva"` muestra
la tabla con sus restricciones e índices.

---

### Paso 2 — Seguridad: JWT y dependencias

**Objetivo:** poder generar tokens y proteger endpoints por rol.

1. [ ] En `core/security.py` implementa `create_access_token` (payload con `sub`, `rol` y `exp`)
       y `decode_access_token` con `pyjwt` y los valores de `settings`.
2. [ ] En `core/deps.py` implementa:
   - [ ] `get_current_user`: usa `OAuth2PasswordBearer` o `HTTPBearer` de FastAPI para leer el
         token, lo decodifica, carga el `Usuario` y devuelve 401 si no existe o 403 si `activo=False`.
   - [ ] `require_rol(*roles)`: devuelve una dependencia que lanza 403 si el rol no coincide.
3. [ ] Escribe tests unitarios en `tests/test_security.py`:
   - [ ] hash + verify de contraseña
   - [ ] crear un token y decodificarlo devuelve los mismos datos
   - [ ] un token caducado o manipulado da error

**Comprobación:** `pytest tests/test_security.py` pasa.

---

### Paso 3 — Base de datos de tests

**Objetivo:** que los tests de endpoints usen una BD aislada y no la de desarrollo.

1. [ ] Crea una segunda base de datos para tests (p. ej. `orquestas_test`) en el mismo contenedor
       de PostgreSQL.
2. [ ] En `tests/conftest.py`: fixture que crea las tablas (`Base.metadata.create_all`) y las borra
       al terminar, o que envuelve cada test en una transacción con rollback.
3. [ ] Sobrescribe la dependencia: `app.dependency_overrides[get_db] = ...`.
4. [ ] Fixtures de ayuda que usarás mucho: `crear_usuario(rol)`, `token_de(usuario)`,
       `cliente_autenticado(rol)`.

**Comprobación:** un test que cree un usuario y luego lo lea funciona dos veces seguidas sin
chocar (la BD queda limpia entre tests).

---

### Paso 4 — Autenticación

**Objetivo:** registro, login y `/auth/me` (SPEC §5 Auth).

1. [ ] Schemas en `schemas/usuario.py`: `RegistroIn`, `LoginIn`, `TokenOut`.
   - En el registro, `rol` solo puede ser `ORQUESTA` o `USUARIO` (nunca `ADMIN`).
   - Según el rol se piden los datos del perfil correspondiente.
2. [ ] `POST /auth/registro`: comprueba que el email no existe (409), crea `Usuario` + perfil en
       la misma transacción. La orquesta queda con `validada=False`.
3. [ ] `POST /auth/login`: verifica credenciales (401 si fallan, 403 si la cuenta está inactiva)
       y devuelve el token.
4. [ ] `GET /auth/me`: devuelve el usuario autenticado (`UsuarioOut`).
5. [ ] Implementa `scripts/crear_admin.py`.
6. [ ] Tests: registro OK, email duplicado, registro como ADMIN rechazado, login correcto/incorrecto,
       `/auth/me` sin token → 401.

**Comprobación:** desde http://localhost:8000/docs regístrate, haz login, pulsa *Authorize* con el
token y llama a `/auth/me`.

---

### Paso 5 — Zona orquesta: perfil y disponibilidad

**Objetivo:** que una orquesta gestione su perfil y sus fechas (SPEC §5 Zona orquesta).

1. [ ] Todas las rutas con `require_rol(Rol.ORQUESTA)`.
2. [ ] `GET/PUT /mi-orquesta`.
3. [ ] `GET /mi-orquesta/disponibilidad`: todas sus fechas con estado, ordenadas por fecha.
4. [ ] `POST /mi-orquesta/disponibilidad`: acepta una lista de fechas.
   - Regla §4.1: rechazar fechas pasadas (422 o 400).
   - Decide qué hacer con fechas ya existentes: ¿error o ignorarlas? Apúntalo en el SPEC.
5. [ ] `DELETE /mi-orquesta/disponibilidad/{id}`:
   - 404 si la fecha no es de esta orquesta (¡no dejes borrar las de otra!).
   - Regla §4.6: 409 si tiene reserva `PENDIENTE` o `ACEPTADA`.
6. [ ] Tests de cada caso anterior, incluido que un `USUARIO` recibe 403.

---

### Paso 6 — Búsqueda pública de orquestas

**Objetivo:** que cualquiera vea orquestas y sus fechas libres (SPEC §5 Orquestas).

1. [ ] `GET /orquestas`: solo orquestas con `validada=True` y usuario `activo=True` (regla §4.7).
   - [ ] Filtro `provincia`.
   - [ ] Filtro `fecha`: solo orquestas con esa fecha en estado `LIBRE` (necesitarás un join).
2. [ ] `GET /orquestas/{id}`: 404 si no existe o no es visible.
3. [ ] `GET /orquestas/{id}/disponibilidad?desde=&hasta=`: solo fechas `LIBRE` y futuras.
4. [ ] Tests: una orquesta no validada no aparece; una desactivada tampoco; los filtros funcionan.

---

### Paso 7 — Reservas (el núcleo del MVP)

**Objetivo:** el flujo completo solicitar → aceptar/rechazar/cancelar (SPEC §4 entero).

Lado usuario (`routers/reservas.py`, rol `USUARIO`):
1. [ ] `GET/PUT /mi-perfil`.
2. [ ] `POST /reservas`:
   - la disponibilidad existe, es futura (§4.1) y está `LIBRE`;
   - la orquesta es visible;
   - crea la reserva `PENDIENTE` y pasa la disponibilidad a `PENDIENTE` (§4.3), **en la misma
     transacción**;
   - si el índice único salta (`IntegrityError`), haz rollback y devuelve 409 (§4.8).
3. [ ] `GET /reservas`: solo las del usuario autenticado.
4. [ ] `POST /reservas/{id}/cancelar`: solo el dueño y solo si está `PENDIENTE` o `ACEPTADA`;
       la disponibilidad vuelve a `LIBRE` (§4.5).

Lado orquesta (`routers/mi_orquesta.py`):
5. [ ] `GET /mi-orquesta/reservas`: solicitudes sobre sus fechas.
6. [ ] `POST .../aceptar`: solo si está `PENDIENTE` → reserva `ACEPTADA`, disponibilidad `RESERVADA` (§4.4).
7. [ ] `POST .../rechazar`: solo si está `PENDIENTE` → reserva `RECHAZADA`, disponibilidad `LIBRE` (§4.5).

Consejo: mete las transiciones de estado en funciones aparte (p. ej. `app/services/reservas.py`)
para que los routers queden cortos y las reglas se puedan testear solas.

8. [ ] Tests (los más importantes del proyecto):
   - [ ] flujo completo solicitar → aceptar
   - [ ] solicitar → rechazar → la fecha vuelve a estar libre y se puede solicitar de nuevo
   - [ ] solicitar una fecha ya `PENDIENTE` → 409
   - [ ] una orquesta no puede aceptar reservas de otra orquesta
   - [ ] un usuario no puede cancelar reservas de otro
   - [ ] (opcional) dos solicitudes en paralelo con hilos: solo una tiene éxito

---

### Paso 8 — Administración

**Objetivo:** SPEC §5 Admin, todas las rutas con `require_rol(Rol.ADMIN)`.

1. [ ] `GET /admin/orquestas?validada=false`.
2. [ ] `POST /admin/orquestas/{id}/validar` → a partir de aquí aparece en búsquedas.
3. [ ] `GET /admin/usuarios` y `PATCH /admin/usuarios/{id}` para activar/desactivar.
       Piensa si un admin puede desactivarse a sí mismo.
4. [ ] `GET /admin/reservas`.
5. [ ] Tests: registrar orquesta → no aparece → validar → aparece.

**Hito:** el backend del MVP está completo. Buen momento para repasar las decisiones abiertas
(SPEC §9) y cerrarlas.

---

### Paso 9 — Frontend: base y autenticación

> ¿Primera vez con React? Lee antes [frontend/GUIA_REACT.md](frontend/GUIA_REACT.md) y haz el
> calentamiento de su última sección.

1. [ ] En `api/client.js`: guarda el token (p. ej. en `localStorage`) y añade
       `Authorization: Bearer ...` a cada petición; si llega un 401, cierra sesión.
2. [ ] Contexto de autenticación (`src/context/AuthContext.jsx`) con `usuario`, `login()`,
       `logout()`, que al cargar la app llama a `/auth/me` si hay token.
3. [ ] Páginas `Login.jsx` y `Registro.jsx` (el registro muestra unos campos u otros según el rol).
4. [ ] Componente `RutaProtegida` que redirige a `/login` si no hay sesión o si el rol no coincide.
5. [ ] Barra de navegación que cambia según el rol.
6. [ ] Borra la comprobación de health de `Inicio.jsx`.

---

### Paso 10 — Frontend: pantallas públicas y de usuario

1. [ ] `/orquestas`: listado con filtros de provincia y fecha.
2. [ ] `/orquestas/:id`: ficha con calendario de fechas libres. Puedes empezar con una simple
       lista de fechas y cambiarla por un calendario después.
3. [ ] Formulario de solicitud desde la ficha (solo visible para `USUARIO`).
4. [ ] `/mis-reservas`: lista con estado y botón de cancelar.
5. [ ] `/mi-perfil`: edición del perfil de contratante.

---

### Paso 11 — Frontend: zonas orquesta y admin

1. [ ] Panel de orquesta: calendario para marcar/desmarcar fechas libres.
2. [ ] Lista de solicitudes recibidas con botones aceptar/rechazar.
3. [ ] Edición del perfil de orquesta (avisando si aún no está validada).
4. [ ] Admin: orquestas pendientes, gestión de usuarios y listado global de reservas.

---

### Paso 12 — Cierre del MVP

1. [ ] Recorre a mano el flujo completo con tres cuentas (orquesta, usuario y admin).
2. [ ] Revisa los mensajes de error que ve el usuario en el frontend.
3. [ ] Todos los tests pasan.
4. [ ] Actualiza el SPEC con cualquier decisión tomada por el camino.
