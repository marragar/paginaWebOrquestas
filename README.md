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
docker compose exec backend python -m scripts.crear_admin admin@ejemplo.com secreto "Administrador"
```

## Estructura

```
backend/
  app/
    main.py          # app FastAPI + registro de routers
    config.py        # configuración (variables de entorno)
    database.py      # engine, sesión, Base, get_db
    core/            # seguridad (hash, JWT) y dependencias (cuenta actual, admin)
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

**Objetivo:** que las cuatro tablas de SPEC §3 existan en PostgreSQL.

1. [ ] Lee `backend/app/models/usuario.py`: es el modelo de referencia. Fíjate en:
   - tipos con `Mapped[...]` y columnas opcionales con `Mapped[str | None]`;
   - el enum con `values_callable` (para guardar `junta_vecinal` y no `JUNTA_VECINAL`);
   - `server_default=func.now()` para `creado_en`.
2. [ ] Escribe los modelos que faltan, uno por fichero:
   - [ ] `orquesta.py` — casi igual que `Usuario`; `precio_base` con `Numeric(10, 2)` y
         `verificada=False` por defecto.
   - [ ] `disponibilidad.py` — enum `EstadoDisponibilidad` (`libre`, `reservada`, `bloqueada`),
         `estado` por defecto `libre` y `UniqueConstraint("orquesta_id", "fecha")`.
   - [ ] `reserva.py` — enum `EstadoReserva`, `estado` por defecto `pendiente`; `lugar`,
         `hora_inicio` y `mensaje` opcionales.
3. [ ] Añade las `relationship()` de SPEC §3 (todas 1:N): orquesta → disponibilidades,
       usuario → reservas, disponibilidad → reservas (con `back_populates` en ambos lados).
4. [ ] Descomenta los imports en `models/__init__.py` (si no, Alembic no ve los modelos).
5. [ ] Regla §4.5 (una sola reserva aceptada): añade en `Reserva` un índice único **parcial**
       sobre `disponibilidad_id` donde `estado = 'aceptada'`
       (`Index(..., unique=True, postgresql_where=...)` dentro de `__table_args__`).
6. [ ] Genera y aplica la migración:
   ```bash
   docker compose exec backend alembic revision --autogenerate -m "modelos iniciales"
   docker compose exec backend alembic upgrade head
   ```
7. [ ] **Revisa el fichero generado** en `alembic/versions/`: autogenerate a veces no detecta
       bien los enums o los índices parciales.

**Comprobación:** `docker compose exec db psql -U orquestas -d orquestas -c "\d reservas"` muestra
la tabla con sus claves foráneas y el índice parcial.

---

### Paso 2 — Seguridad: JWT y dependencias

**Objetivo:** poder generar tokens para los dos tipos de cuenta y proteger endpoints.

Idea clave: hay **dos tablas de cuentas**, así que el id no basta (el usuario 5 y la orquesta 5
son cuentas distintas). El token debe llevar también el tipo (`TipoCuenta` en `core/security.py`).

1. [ ] En `core/security.py` implementa `create_access_token` (payload con `sub`, `tipo` y `exp`)
       y `decode_access_token` con `pyjwt` y los valores de `settings`.
2. [ ] En `core/deps.py` implementa:
   - [ ] `get_current_usuario`: usa `HTTPBearer` (o `OAuth2PasswordBearer`) de FastAPI para leer
         el token, comprueba que es de tipo `usuario` y carga el `Usuario`. 401 si el token no es
         válido o la cuenta no existe; 403 si es un token de orquesta.
   - [ ] `get_current_orquesta`: lo mismo para orquestas.
   - [ ] `get_current_admin`: reutiliza `get_current_usuario` y da 403 si `es_admin` es `False`.
3. [ ] Escribe tests unitarios en `tests/test_security.py`:
   - [ ] hash + verify de contraseña
   - [ ] crear un token y decodificarlo devuelve el mismo id y tipo
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
4. [ ] Fixtures de ayuda que usarás mucho: `crear_usuario(es_admin=False)`, `crear_orquesta(verificada=True)`,
       `crear_disponibilidad(orquesta, fecha)` y `headers_de(cuenta)` (devuelve la cabecera con el token).

**Comprobación:** un test que cree un usuario y luego lo lea funciona dos veces seguidas sin
chocar (la BD queda limpia entre tests).

---

### Paso 4 — Autenticación

**Objetivo:** registro y login separados para usuarios y orquestas, y `/auth/me` (SPEC §5 Auth).

1. [ ] Schemas:
   - [ ] `UsuarioRegistroIn` en `schemas/usuario.py` — **sin** `es_admin` (si no, cualquiera
         podría registrarse como admin).
   - [ ] `OrquestaRegistroIn` y `OrquestaOut` en `schemas/orquesta.py` — sin `verificada`.
   - [ ] `LoginIn` y `TokenOut` en `schemas/auth.py`.
2. [ ] Una función auxiliar `email_en_uso(db, email)` que busque en **las dos tablas**
       (regla §4.11). La usarás en los dos registros y en `crear_admin`.
3. [ ] `POST /auth/usuarios/registro` y `POST /auth/orquestas/registro`: 409 si el email está en
       uso; guardan `hash_password(password)`, nunca la contraseña.
4. [ ] `POST /auth/usuarios/login` y `POST /auth/orquestas/login`: 401 si las credenciales
       fallan (mismo mensaje tanto si el email no existe como si la contraseña está mal).
5. [ ] `GET /auth/me`: según el `tipo` del token devuelve `UsuarioOut` u `OrquestaOut`
       (incluye el tipo en la respuesta para que el frontend sepa qué cuenta es).
6. [ ] Implementa `scripts/crear_admin.py`.
7. [ ] Tests:
   - [ ] registro OK de cada tipo
   - [ ] email repetido en la misma tabla → 409
   - [ ] email de una orquesta usado para registrar un usuario (y al revés) → 409
   - [ ] enviar `es_admin: true` en el registro no crea un admin
   - [ ] login correcto/incorrecto; una orquesta no puede entrar por el login de usuarios
   - [ ] `/auth/me` sin token → 401

**Comprobación:** desde http://localhost:8000/docs regístrate, haz login, pulsa *Authorize* con el
token y llama a `/auth/me`.

---

### Paso 5 — Zona orquesta: perfil y disponibilidad

**Objetivo:** que una orquesta gestione su perfil y sus fechas (SPEC §5 Zona orquesta).

1. [ ] Todas las rutas con `Depends(get_current_orquesta)`.
2. [ ] `GET/PUT /mi-orquesta` (el `PUT` no debe permitir cambiar `verificada` ni `email`).
3. [ ] `GET /mi-orquesta/disponibilidad`: todas sus fechas con estado, ordenadas por fecha.
4. [ ] `POST /mi-orquesta/disponibilidad`: acepta una lista de fechas (con precio y notas opcionales).
   - Regla §4.1: rechazar fechas pasadas (422 o 400).
   - Decide qué hacer con fechas ya existentes: ¿error o ignorarlas? Apúntalo en el SPEC.
5. [ ] `PATCH /mi-orquesta/disponibilidad/{id}`: cambiar precio, notas y pasar entre `libre` y
       `bloqueada` (§4.8). No se puede tocar a mano el estado `reservada`.
6. [ ] `DELETE /mi-orquesta/disponibilidad/{id}`:
   - 404 si la fecha no es de esta orquesta (¡no dejes borrar las de otra!).
   - Regla §4.9: 409 si tiene una reserva `aceptada`.
   - Si tiene reservas `pendiente`, decide qué pasa (SPEC §9) y apúntalo.
7. [ ] Tests de cada caso anterior, incluido que un token de usuario recibe 403.

---

### Paso 6 — Búsqueda pública de orquestas

**Objetivo:** que cualquiera vea orquestas y sus fechas libres (SPEC §5 Orquestas).

1. [ ] `GET /orquestas`: solo orquestas con `verificada=True` (regla §4.10).
   - [ ] Filtro `provincia`.
   - [ ] Filtro `fecha`: solo orquestas con esa fecha en estado `libre` (necesitarás un join).
2. [ ] `GET /orquestas/{id}`: 404 si no existe o no está verificada.
3. [ ] `GET /orquestas/{id}/disponibilidad?desde=&hasta=`: solo fechas `libre` y futuras. Si una
       fecha no tiene `precio`, decide si devuelves el `precio_base` de la orquesta.
4. [ ] Los schemas públicos **no** deben incluir `email` ni `password_hash`.
5. [ ] Tests: una orquesta no verificada no aparece; las fechas bloqueadas o reservadas no
       aparecen; los filtros funcionan.

---

### Paso 7 — Reservas (el núcleo del MVP)

**Objetivo:** el flujo completo solicitar → aceptar/rechazar/cancelar (SPEC §4 entero).

Lado usuario (`routers/reservas.py`, con `get_current_usuario`):
1. [ ] `GET/PUT /mi-perfil` (el `PUT` no debe permitir cambiar `es_admin` ni `email`).
2. [ ] `POST /reservas`:
   - la disponibilidad existe, es futura (§4.1) y está `libre` (§4.2);
   - la orquesta está verificada;
   - el usuario no tiene ya una reserva `pendiente` sobre esa disponibilidad (§4.3);
   - crea la reserva en estado `pendiente`. **La disponibilidad no cambia**: otros pueblos
     pueden seguir pidiendo ese día.
3. [ ] `GET /reservas`: solo las del usuario autenticado, con los datos de la fecha y la orquesta.
4. [ ] `POST /reservas/{id}/cancelar`: solo el dueño y solo si está `pendiente` o `aceptada`.
       Si estaba `aceptada`, la disponibilidad vuelve a `libre` (§4.7).

Lado orquesta (`routers/mi_orquesta.py`):
5. [ ] `GET /mi-orquesta/reservas`: solicitudes sobre sus fechas (filtro opcional por estado).
6. [ ] `POST .../aceptar` (§4.4 y §4.5) — **todo en una transacción**:
   - la reserva es de una fecha de esta orquesta (si no, 404) y está `pendiente` (si no, 409);
   - bloquea la fila de la disponibilidad con `SELECT ... FOR UPDATE`
     (`select(...).with_for_update()`) para que dos aceptaciones simultáneas no se pisen;
   - reserva → `aceptada`, disponibilidad → `reservada`, resto de `pendiente` de ese día → `rechazada`;
   - si aun así salta el índice único (`IntegrityError`), rollback y 409.
7. [ ] `POST .../rechazar`: solo si está `pendiente` → `rechazada`. La disponibilidad no cambia (§4.6).

Consejo: mete las transiciones de estado en funciones aparte (p. ej. `app/services/reservas.py`)
para que los routers queden cortos y las reglas se puedan testear solas.

8. [ ] Tests (los más importantes del proyecto):
   - [ ] dos usuarios solicitan el mismo día → ambas reservas quedan `pendiente`
   - [ ] la orquesta acepta una → esa `aceptada`, la otra `rechazada`, fecha `reservada`
   - [ ] solicitar una fecha `reservada` o `bloqueada` → 409
   - [ ] el mismo usuario solicita dos veces el mismo día → 409
   - [ ] cancelar una reserva aceptada → la fecha vuelve a `libre` y se puede solicitar de nuevo
   - [ ] una orquesta no puede aceptar reservas de otra orquesta
   - [ ] un usuario no puede cancelar reservas de otro
   - [ ] (opcional) dos aceptaciones en paralelo con hilos: solo una tiene éxito

---

### Paso 8 — Administración

**Objetivo:** SPEC §5 Admin, todas las rutas con `Depends(get_current_admin)`.

1. [ ] `GET /admin/orquestas?verificada=false`.
2. [ ] `POST /admin/orquestas/{id}/verificar` → a partir de aquí aparece en búsquedas.
3. [ ] `GET /admin/usuarios`.
4. [ ] `GET /admin/reservas` (filtros útiles: estado, orquesta, fecha).
5. [ ] Tests: un usuario normal recibe 403; una orquesta recibe 403; registrar orquesta →
       no aparece → verificar → aparece.

**Hito:** el backend del MVP está completo. Buen momento para repasar las decisiones abiertas
(SPEC §9) y cerrarlas.

---

### Paso 9 — Frontend: base y autenticación

> ¿Primera vez con React? Lee antes [frontend/GUIA_REACT.md](frontend/GUIA_REACT.md) y haz el
> calentamiento de su última sección.

1. [ ] En `api/client.js`: guarda el token (p. ej. en `localStorage`) y añade
       `Authorization: Bearer ...` a cada petición; si llega un 401, cierra sesión.
2. [ ] Contexto de autenticación (`src/context/AuthContext.jsx`) con `cuenta` (usuario u
       orquesta, con su tipo), `login(tipo, email, password)` y `logout()`. Al cargar la app llama
       a `/auth/me` si hay token.
3. [ ] Página `Login.jsx` con la elección "Soy usuario" / "Soy orquesta", que llama al endpoint
       de login correspondiente.
4. [ ] Página `Registro.jsx` con la misma elección y un formulario distinto para cada tipo.
5. [ ] Componente `RutaProtegida` que redirige a `/login` si no hay sesión o si el tipo de
       cuenta no es el que toca (y otra variante para admin).
6. [ ] Barra de navegación que cambia según el tipo de cuenta y si es admin.
7. [ ] Borra la comprobación de health de `Inicio.jsx`.

---

### Paso 10 — Frontend: pantallas públicas y de usuario

1. [ ] `/orquestas`: listado con filtros de provincia y fecha.
2. [ ] `/orquestas/:id`: ficha con calendario de fechas libres y su precio. Puedes empezar con
       una simple lista de fechas y cambiarla por un calendario después.
3. [ ] Formulario de solicitud desde la ficha (lugar, hora de inicio, mensaje); solo visible para
       usuarios.
4. [ ] `/mis-reservas`: lista con estado y botón de cancelar.
5. [ ] `/mi-perfil`: edición de los datos del usuario.

---

### Paso 11 — Frontend: zonas orquesta y admin

1. [ ] Panel de orquesta: calendario para añadir fechas (con precio), bloquearlas y retirarlas.
2. [ ] Lista de solicitudes recibidas agrupadas por fecha, con botones aceptar/rechazar
       (al aceptar una, las demás del mismo día aparecen como rechazadas).
3. [ ] Edición del perfil de orquesta (avisando si aún no está verificada).
4. [ ] Admin: orquestas pendientes de verificar, listado de usuarios y listado global de reservas.

---

### Paso 12 — Cierre del MVP

1. [ ] Recorre a mano el flujo completo con tres cuentas (orquesta, usuario y admin).
2. [ ] Revisa los mensajes de error que ve el usuario en el frontend.
3. [ ] Todos los tests pasan.
4. [ ] Actualiza el SPEC con cualquier decisión tomada por el camino.
