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
    core/            # seguridad (hash, JWT), dependencias (cuenta actual, admin) y errores con código
    models/          # modelos SQLAlchemy (usuario.py es el ejemplo de referencia)
    schemas/         # modelos Pydantic de entrada/salida (formas que espera el frontend: SPEC §5.2)
    routers/         # un fichero por bloque de la API (SPEC §5)
  alembic/           # migraciones
  scripts/           # comandos sueltos (crear admin)
  tests/
frontend/
  src/
    api/client.js    # fetch hacia /api
    pages/           # una página por pantalla (SPEC §6); zonas en usuario/, orquesta/ y admin/
    components/      # piezas reutilizables (cabecera, calendario, ajustes...)
    context/         # preferencias (idioma, tema) y sesión simulada (temporal)
    i18n/            # textos en español, inglés y gallego (incluidos los de los errores de la API)
    datos/demo.js    # datos de ejemplo (temporal, hasta conectar la API)
    utilidades/      # formato de fechas y precios, hooks
```

## Guía de desarrollo paso a paso

Cada paso indica **qué hacer**, **dónde** y **cómo comprobar que funciona** antes de pasar al
siguiente. Marca las casillas conforme avances. Si algo del SPEC cambia por el camino, actualiza
primero `SPEC.md`.

> 🆕 **Cambios tras maquetar el frontend (septiembre de 2026).** El frontend ya tiene todas las
> pantallas hechas con datos de ejemplo, en tres idiomas (español, inglés y gallego) y con modo
> oscuro. Eso añade algunas cosas al backend: errores con código en vez de frases, precios como
> número, respuestas con datos anidados, operaciones sobre varias fechas y un par de endpoints
> nuevos. Todo está en SPEC §4 (reglas 12-14), §5, §5.1 y §5.2. Los puntos nuevos o cambiados de
> esta guía llevan 🆕.

---

### Paso 0 — Poner en marcha la plantilla

1. [x] Copia `.env.example` a `.env` (si no existe ya) y cambia `JWT_SECRET`.
2. [x] Arranca Docker Desktop y ejecuta `docker compose up --build`.
3. [x] Comprueba:
   - http://localhost:8000/api/health devuelve `{"status": "ok"}`
   - 🆕 http://localhost:5173 muestra la portada de Verbena (la comprobación «Backend: ok» se
     quitó al maquetar el inicio; para ver que el proxy llega al backend abre
     http://localhost:5173/api/health)
   - `docker compose exec backend pytest` pasa.
4. [x] Haz el primer commit con la plantilla.

---

### Paso 1 — Modelos de datos y primera migración

**Objetivo:** que las cuatro tablas de SPEC §3 existan en PostgreSQL.

1. [x] Lee `backend/app/models/usuario.py`: es el modelo de referencia. Fíjate en:
   - tipos con `Mapped[...]` y columnas opcionales con `Mapped[str | None]`;
   - el enum con `values_callable` (para guardar `junta_vecinal` y no `JUNTA_VECINAL`);
   - `server_default=func.now()` para `creado_en`.
2. [x] Escribe los modelos que faltan, uno por fichero:
   - [x] `orquesta.py` — casi igual que `Usuario`; `precio_base` con `Numeric(10, 2)` y
         `verificada=False` por defecto.
   - [x] `disponibilidad.py` — enum `EstadoDisponibilidad` (`libre`, `reservada`, `bloqueada`),
         `estado` por defecto `libre` y `UniqueConstraint("orquesta_id", "fecha")`.
   - [x] `reserva.py` — enum `EstadoReserva`, `estado` por defecto `pendiente`; `lugar`,
         `hora_inicio` y `mensaje` opcionales.
3. [x] Añade las `relationship()` de SPEC §3 (todas 1:N): orquesta → disponibilidades,
       usuario → reservas, disponibilidad → reservas (con `back_populates` en ambos lados).
4. [x] Descomenta los imports en `models/__init__.py` (si no, Alembic no ve los modelos).
5. [x] Regla §4.5 (una sola reserva aceptada): añade en `Reserva` un índice único **parcial**
       sobre `disponibilidad_id` donde `estado = 'aceptada'`
       (`Index(..., unique=True, postgresql_where=...)` dentro de `__table_args__`).
6. [x] Genera y aplica la migración:
   ```bash
   docker compose exec backend alembic revision --autogenerate -m "modelos iniciales"
   docker compose exec backend alembic upgrade head
   ```
7. [x] **Revisa el fichero generado** en `alembic/versions/`: autogenerate a veces no detecta
       bien los enums o los índices parciales.

**Comprobación:** `docker compose exec db psql -U orquestas -d orquestas -c "\d reservas"` muestra
la tabla con sus claves foráneas y el índice parcial.

#### 🆕 Paso 1b — Alinear los modelos actuales con el SPEC

Los modelos ya creados difieren del SPEC en varios puntos que el frontend necesita. Cada fichero
de `models/` tiene un comentario `TODO (revisión frente a SPEC §3 y el frontend)` con el detalle.

1. [x] **Primero, el que rompe todo:** en `Disponibilidad` falta
       `reservas: Mapped[list["Reserva"]] = relationship(back_populates="disponibilidad")`.
       Sin él, SQLAlchemy da `Mapper 'Disponibilidad' has no property 'reservas'` en cuanto se usa
       cualquier modelo.
2. [ ] Corrige los imports de `TYPE_CHECKING`: `from app.models.… import …` (sin `backend.`).
3. [x] `EstadoDisponibilidad`: los valores deben ser `libre`, `reservada` y `bloqueada` (el
       frontend usa esos). `precio` obligatorio y `fecha` con tipo `Mapped[date]`.
4. [x] `EstadoReserva`: añade `cancelada` (§4.7). Cambia `notas` por `lugar` (varchar) y
       `mensaje` (text), los dos opcionales, y haz opcional `hora_inicio`.
5. [ ] `Orquesta`: `telefono` y `provincia` se quedan obligatorios (decidido), así que hay que
       añadir el teléfono al formulario de registro del frontend. Decide qué hacer con el campo
       `tipo` (SPEC §9) y apúntalo en el SPEC.
6. [x] `Usuario.telefono`: `String(9)` no cabe con espacios; amplíalo a 20 o guarda solo dígitos.
7. [x] Genera la migración y **escribe a mano** los cambios de enum, porque autogenerate no los
       detecta:
   ```python
   op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'disponible' TO 'libre'")
   op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'reservado' TO 'reservada'")
   op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'no_disponible' TO 'bloqueada'")
   op.execute("ALTER TYPE estado_reserva ADD VALUE 'cancelada'")
   ```
   Cambia también el `server_default`/`default` del estado si hace falta. En el `downgrade`,
   renombra al revés (quitar un valor de un enum en PostgreSQL no es posible sin recrearlo;
   basta con dejarlo documentado).

**Comprobación:** `docker compose exec backend python -c "import app.models; from sqlalchemy.orm
import configure_mappers; configure_mappers()"` no da error, y `\dT+ estado_disponibilidad` en
`psql` muestra `libre`, `reservada` y `bloqueada`.

---

### Paso 2 — Seguridad: JWT, dependencias y errores

**Objetivo:** poder generar tokens para los dos tipos de cuenta, proteger endpoints y devolver
errores que el frontend pueda traducir.

Idea clave: hay **dos tablas de cuentas**, así que el id no basta (el usuario 5 y la orquesta 5
son cuentas distintas). El token debe llevar también el tipo (`TipoCuenta` en `core/security.py`).

1. [x] En `core/security.py` implementa `create_access_token` (payload con `sub`, `tipo` y `exp`)
       y `decode_access_token` con `pyjwt` y los valores de `settings`.
2. [x] 🆕 Lee `core/errores.py`: `error_negocio(status, codigo, mensaje)` crea el error con el
       formato `{"detail": {"codigo", "mensaje"}}` de SPEC §5.1. **Úsalo en todos los errores de
       negocio** de aquí en adelante: el frontend está en tres idiomas y traduce el `codigo`
       (los textos ya están en `frontend/src/i18n/*.js`, sección `errores`). Si necesitas un
       código nuevo, añádelo en `CODIGOS`, en SPEC §5.1 y en los tres ficheros de idioma.
3. [x] En `core/deps.py` implementa:
   - [x] `get_current_usuario`: usa `HTTPBearer` (o `OAuth2PasswordBearer`) de FastAPI para leer
         el token, comprueba que es de tipo `usuario` y carga el `Usuario`. 🆕 401
         `no_autenticado` si el token no es válido o la cuenta no existe; 403 `sin_permiso` si es
         un token de orquesta.
   - [x] `get_current_orquesta`: lo mismo para orquestas.
   - [x] `get_current_admin`: reutiliza `get_current_usuario` y da 403 `sin_permiso` si
         `es_admin` es `False`.
   - [x] 🆕 `get_current_cuenta`: acepta los dos tipos de token y devuelve `(rol, cuenta)`, con
         rol `usuario`, `orquesta` o `admin`. Lo usa `GET /auth/me`.
4. [x] Escribe tests unitarios en `tests/test_security.py`:
   - [x] hash + verify de contraseña
   - [x] crear un token y decodificarlo devuelve el mismo id y tipo
   - [x] un token caducado o manipulado da error

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
5. [ ] 🆕 Un helper `assert_error(respuesta, status, codigo)` que compruebe el código HTTP y
       `respuesta.json()["detail"]["codigo"]`. Los tests de reglas de negocio deben comprobar el
       **código**, no el texto.
6. [ ] Completa `tests/test_security.py` con los casos de `core/deps.py` que necesitan cuentas
       reales (los del Paso 2 solo cubren lo que falla antes de ir a la BD):
   - [ ] `get_current_usuario` / `get_current_orquesta` devuelven la cuenta si existe
   - [ ] token válido de una cuenta que ya no existe → 401 `no_autenticado`
   - [ ] `get_current_admin` con usuario normal → 403 `sin_permiso`; con admin, deja pasar
   - [ ] `get_current_cuenta` devuelve el rol correcto (`usuario`, `admin`, `orquesta`)

**Comprobación:** un test que cree un usuario y luego lo lea funciona dos veces seguidas sin
chocar (la BD queda limpia entre tests).

---

### Paso 4 — Autenticación

**Objetivo:** registro y login separados para usuarios y orquestas, y `/auth/me` (SPEC §5 Auth).

1. [ ] Schemas (plantillas con `TODO` en `schemas/`):
   - [ ] `UsuarioRegistroIn` en `schemas/usuario.py` — **sin** `es_admin` (si no, cualquiera
         podría registrarse como admin). 🆕 `password` con `Field(min_length=8)`: el frontend
         avisa de «Mínimo 8 caracteres».
   - [ ] `OrquestaRegistroIn` en `schemas/orquesta.py` — sin `verificada`. 🆕 En lugar de un
         único `OrquestaOut` hay tres: `OrquestaPrivadaOut` (la propia orquesta y el admin),
         `OrquestaPublicaOut` (ficha, sin email) y `OrquestaResumenOut` (para anidar).
   - [ ] `LoginIn` y `TokenOut` en `schemas/auth.py`. 🆕 Y `MeOut`.
2. [ ] Una función auxiliar `email_en_uso(db, email)` que busque en **las dos tablas**
       (regla §4.11). La usarás en los dos registros y en `crear_admin`.
3. [ ] `POST /auth/usuarios/registro` y `POST /auth/orquestas/registro`: 🆕 409
       `email_repetido` si el email está en uso; guardan `hash_password(password)`, nunca la
       contraseña.
4. [ ] `POST /auth/usuarios/login` y `POST /auth/orquestas/login`: 🆕 401
       `credenciales_incorrectas` si fallan (el mismo tanto si el email no existe como si la
       contraseña está mal).
5. [ ] 🆕 `GET /auth/me`: devuelve `{"rol": "usuario" | "orquesta" | "admin", "cuenta": {...}}`
       (SPEC §5.2). El frontend decide el menú con `rol`.
6. [ ] Implementa `scripts/crear_admin.py`.
7. [ ] Tests:
   - [ ] registro OK de cada tipo
   - [ ] email repetido en la misma tabla → 409 `email_repetido`
   - [ ] email de una orquesta usado para registrar un usuario (y al revés) → 409 `email_repetido`
   - [ ] enviar `es_admin: true` en el registro no crea un admin
   - [ ] 🆕 contraseña de menos de 8 caracteres → 422
   - [ ] login correcto/incorrecto; una orquesta no puede entrar por el login de usuarios
   - [ ] `/auth/me` sin token → 401; 🆕 con token de admin devuelve `rol: "admin"`

**Comprobación:** desde http://localhost:8000/docs regístrate, haz login, pulsa *Authorize* con el
token y llama a `/auth/me`.

---

### Paso 5 — Zona orquesta: perfil y disponibilidad

**Objetivo:** que una orquesta gestione su perfil y sus fechas (SPEC §5 Zona orquesta). 🆕 El
calendario del frontend permite **marcar varios días** y publicarlos, bloquearlos, desbloquearlos,
cambiarles el precio o retirarlos de una vez.

1. [ ] Todas las rutas con `Depends(get_current_orquesta)`.
2. [ ] `GET/PUT /mi-orquesta` (el `PUT` no debe permitir cambiar `verificada` ni `email`).
3. [ ] `GET /mi-orquesta/disponibilidad`: todas sus fechas con estado, ordenadas por fecha.
       🆕 Cada una con `precio_final` (ver punto 8).
4. [ ] `POST /mi-orquesta/disponibilidad`: acepta una lista de fechas (con precio y notas opcionales).
   - Regla §4.1: 🆕 422 `fecha_pasada`.
   - 🆕 Decidido en el SPEC: si una fecha ya existe → 409 `fecha_duplicada` con la fecha en el
     `detail`, y **no se crea ninguna** (§4.13, una sola transacción).
   - 🆕 Acepta `estado`: `libre` (por defecto) o `bloqueada`. Bloquear un día sin fila la crea
     como `bloqueada` (§4.12).
5. [ ] `PATCH /mi-orquesta/disponibilidad/{id}`: cambiar precio, notas y pasar entre `libre` y
       `bloqueada` (§4.8). No se puede tocar a mano el estado `reservada` (🆕 409
       `fecha_con_reserva`, §4.14).
6. [ ] 🆕 `PATCH /mi-orquesta/disponibilidad` (sin id): lo mismo para varias fechas
       (`{"ids": [...], "estado"?, "precio"?}`), todo o nada.
7. [ ] `DELETE /mi-orquesta/disponibilidad/{id}`:
   - 404 `no_encontrado` si la fecha no es de esta orquesta (¡no dejes borrar las de otra!).
   - Regla §4.9: 409 `fecha_con_reserva` si tiene una reserva `aceptada`.
   - Si tiene reservas `pendiente`, decide qué pasa (SPEC §9) y apúntalo.
   - [ ] 🆕 `DELETE /mi-orquesta/disponibilidad?ids=1,2,3`: varias a la vez, todo o nada.
8. [ ] 🆕 **Precios en las respuestas:** `precio_final` = `precio` o, si es nulo, `precio_base`
       de la orquesta (SPEC §5.1). Y en los schemas de salida los precios van como `float`:
       Pydantic v2 serializa `Decimal` como texto y el frontend espera números.
9. [ ] Tests de cada caso anterior, incluido que un token de usuario recibe 403. 🆕 Y que en una
       operación múltiple con una fecha mala no se aplica ninguna.

---

### Paso 6 — Búsqueda pública de orquestas

**Objetivo:** que cualquiera vea orquestas y sus fechas libres (SPEC §5 Orquestas).

1. [ ] `GET /orquestas`: solo orquestas con `verificada=True` (regla §4.10).
   - [ ] Filtro `provincia`.
   - [ ] Filtro `fecha`: solo orquestas con esa fecha en estado `libre` (necesitarás un join).
   - [ ] 🆕 Cada orquesta con `proximas_libres`: sus 5 próximas fechas libres (el listado las
         enseña como hojas de calendario). Cárgalas en **una** consulta para todas las orquestas,
         no una por orquesta (problema N+1).
2. [ ] `GET /orquestas/{id}`: 404 `no_encontrado` si no existe o no está verificada. 🆕 Incluye
       `telefono`: la ficha tiene botón «Llamar».
3. [ ] `GET /orquestas/{id}/disponibilidad?desde=&hasta=`: solo fechas `libre` y futuras. 🆕
       Decidido en el SPEC: cada fecha lleva `precio_final`.
4. [ ] 🆕 `GET /disponibilidades/proximas?limite=6` (`routers/disponibilidades.py`, ya registrado
       en `main.py`): próximas fechas libres de todas las orquestas verificadas, con la orquesta
       resumida. Es la lista «Días libres más cercanos» de la portada.
5. [ ] Los schemas públicos **no** deben incluir `email` ni `password_hash`.
6. [ ] Tests: una orquesta no verificada no aparece (🆕 tampoco en `/disponibilidades/proximas`);
       las fechas bloqueadas o reservadas no aparecen; los filtros funcionan.

---

### Paso 7 — Reservas (el núcleo del MVP)

**Objetivo:** el flujo completo solicitar → aceptar/rechazar/cancelar (SPEC §4 entero).

🆕 Las respuestas llevan datos anidados (fecha, orquesta u organizador) porque las pantallas los
enseñan juntos: la forma exacta está en SPEC §5.2 y en las plantillas de `schemas/reserva.py`.
Usa `selectinload`/`joinedload` para no hacer una consulta por reserva.

Lado usuario (`routers/reservas.py`, con `get_current_usuario`):
1. [ ] `GET/PUT /mi-perfil` (el `PUT` no debe permitir cambiar `es_admin` ni `email`).
2. [ ] `POST /reservas` (🆕 cuerpo: `disponibilidad_id`, `lugar`, `hora_inicio`, `mensaje`):
   - la disponibilidad existe, es futura (§4.1, 🆕 `fecha_pasada`) y está `libre` (§4.2, 🆕
     `fecha_no_libre`);
   - la orquesta está verificada;
   - el usuario no tiene ya una reserva `pendiente` sobre esa disponibilidad (§4.3, 🆕
     `solicitud_duplicada`);
   - crea la reserva en estado `pendiente`. **La disponibilidad no cambia**: otros pueblos
     pueden seguir pidiendo ese día.
3. [ ] `GET /reservas`: solo las del usuario autenticado, con los datos de la fecha y la orquesta.
       🆕 Incluye `precio_final` y el `telefono` de la orquesta («Mis reservas» tiene botón
       «Llamar»). Filtro opcional `?estado=`.
4. [ ] `POST /reservas/{id}/cancelar`: solo el dueño y solo si está `pendiente` o `aceptada`
       (🆕 si no, 409 `estado_no_valido`). Si estaba `aceptada`, la disponibilidad vuelve a
       `libre` (§4.7).

Lado orquesta (`routers/mi_orquesta.py`):
5. [ ] `GET /mi-orquesta/reservas`: solicitudes sobre sus fechas (filtro opcional por estado).
       🆕 Con los datos del organizador (nombre, tipo, municipio, provincia, teléfono). La
       cabecera del frontend usa `?estado=pendiente` para el aviso con el número sin responder.
6. [ ] `POST .../aceptar` (§4.4 y §4.5) — **todo en una transacción**:
   - la reserva es de una fecha de esta orquesta (si no, 404) y está `pendiente` (si no, 409
     🆕 `estado_no_valido`);
   - bloquea la fila de la disponibilidad con `SELECT ... FOR UPDATE`
     (`select(...).with_for_update()`) para que dos aceptaciones simultáneas no se pisen;
   - reserva → `aceptada`, disponibilidad → `reservada`, resto de `pendiente` de ese día → `rechazada`;
   - si aun así salta el índice único (`IntegrityError`), rollback y 409 🆕 `ya_aceptada`.
   - 🆕 La respuesta es `{"reserva": ..., "rechazadas": n}`: el frontend avisa de cuántas
     solicitudes del mismo día se han rechazado.
7. [ ] `POST .../rechazar`: solo si está `pendiente` → `rechazada`. La disponibilidad no cambia (§4.6).

Consejo: mete las transiciones de estado en funciones aparte (p. ej. `app/services/reservas.py`)
para que los routers queden cortos y las reglas se puedan testear solas.

8. [ ] Tests (los más importantes del proyecto):
   - [ ] dos usuarios solicitan el mismo día → ambas reservas quedan `pendiente`
   - [ ] la orquesta acepta una → esa `aceptada`, la otra `rechazada`, fecha `reservada`
         (🆕 y la respuesta trae `rechazadas: 1`)
   - [ ] solicitar una fecha `reservada` o `bloqueada` → 409 `fecha_no_libre`
   - [ ] el mismo usuario solicita dos veces el mismo día → 409 `solicitud_duplicada`
   - [ ] cancelar una reserva aceptada → la fecha vuelve a `libre` y se puede solicitar de nuevo
   - [ ] una orquesta no puede aceptar reservas de otra orquesta
   - [ ] un usuario no puede cancelar reservas de otro
   - [ ] (opcional) dos aceptaciones en paralelo con hilos: solo una tiene éxito

---

### Paso 8 — Administración

**Objetivo:** SPEC §5 Admin, todas las rutas con `Depends(get_current_admin)`.

1. [ ] `GET /admin/orquestas?verificada=false` (🆕 con email y teléfono: el admin los necesita
       para verificar).
2. [ ] `POST /admin/orquestas/{id}/verificar` → a partir de aquí aparece en búsquedas.
3. [ ] `GET /admin/usuarios` (🆕 con `creado_en`: la tabla muestra la fecha de alta).
4. [ ] `GET /admin/reservas` (filtros útiles: estado, orquesta, fecha). 🆕 Con fecha, orquesta,
       organizador y `precio_final`.
5. [ ] Tests: un usuario normal recibe 403; una orquesta recibe 403; registrar orquesta →
       no aparece → verificar → aparece.

**Hito:** el backend del MVP está completo. Buen momento para repasar las decisiones abiertas
(SPEC §9) y cerrarlas.

---

### 🆕 Paso 9 — Frontend: conectar la autenticación

> ¿Primera vez con React? Lee antes [frontend/GUIA_REACT.md](frontend/GUIA_REACT.md) y haz el
> calentamiento de su última sección.

Las pantallas ya existen y funcionan con datos de ejemplo (`src/datos/demo.js`) y una sesión
simulada (`src/context/SesionDemo.jsx`, con el selector «Ver la maqueta como» del pie). Ahora se
trata de **sustituir lo simulado por lo real**, sin rehacer pantallas.

1. [ ] En `api/client.js` (tiene los `TODO`): guarda el token (p. ej. en `localStorage`) y añade
       `Authorization: Bearer ...` a cada petición; si llega un 401, cierra sesión. Lanza los
       errores con su `codigo` (SPEC §5.1).
2. [ ] Crea `src/context/AuthContext.jsx` con la **misma forma** que `SesionDemo`
       (`{ rol, cuenta, ... }`) más `login(tipo, email, password)` y `logout()`. Al cargar la app
       llama a `/auth/me` si hay token y guarda el `rol` que devuelve.
3. [ ] Cambia los `useSesion()` por `useAuth()` (búscalos con el buscador del editor), borra
       `SesionDemo.jsx` y el selector de maqueta de `components/Pie.jsx`.
4. [ ] `pages/Acceso.jsx` ya tiene la elección «Organizo fiestas» / «Tengo una orquesta» y los dos
       formularios: cambia el `TODO` de `enviar()` por la llamada al login o registro que toque.
5. [ ] Para mostrar un error: ``t(`errores.${error.codigo}`)`` (los textos ya están en los tres
       idiomas en `src/i18n/*.js`). Si el error trae más datos (p. ej. `fecha`), pásalos como
       variables: `t('errores.fecha_duplicada', { fecha: fechaLarga(error.fecha) })`.
6. [ ] El componente `Zona` de `App.jsx` ya protege las rutas por rol: solo cambia `useSesion` por
       `useAuth`.

---

### 🆕 Paso 10 — Frontend: pantallas públicas y de usuario con datos reales

Cada pantalla importa hoy sus datos de `datos/demo.js` y tiene un `// TODO:` con el endpoint en
cada acción. Cambia los imports por llamadas a `api()` con `useEffect` (GUIA_REACT §11), y
muestra un estado de carga y los errores traducidos.

1. [ ] `pages/Inicio.jsx`: `GET /disponibilidades/proximas`.
2. [ ] `pages/Orquestas.jsx`: `GET /orquestas?provincia=&fecha=` (los filtros ya están en la URL).
3. [ ] `pages/FichaOrquesta.jsx`: `GET /orquestas/{id}` y `GET /orquestas/{id}/disponibilidad`;
       la solicitud hace `POST /reservas`.
4. [ ] `pages/usuario/MisReservas.jsx`: `GET /reservas` y `POST /reservas/{id}/cancelar`.
5. [ ] `pages/usuario/PerfilUsuario.jsx`: `GET/PUT /mi-perfil`.
6. [ ] Cuando ninguna pantalla importe ya `datos/demo.js`, bórralo. Mueve antes la lista
       `PROVINCIAS` a otro sitio (p. ej. `src/datos/provincias.js`): la usan los desplegables.

---

### 🆕 Paso 11 — Frontend: zonas orquesta y admin con datos reales

1. [ ] `pages/orquesta/PanelCalendario.jsx`: `GET /mi-orquesta/disponibilidad`; las acciones
       (publicar, bloquear, desbloquear, cambiar precio, retirar) usan las versiones **múltiples**
       de `POST`/`PATCH`/`DELETE /mi-orquesta/disponibilidad`.
2. [ ] `pages/orquesta/Solicitudes.jsx`: `GET /mi-orquesta/reservas`, aceptar y rechazar. El
       aviso tras aceptar usa `rechazadas` de la respuesta.
3. [ ] `components/Cabecera.jsx`: el número de solicitudes sin responder con
       `GET /mi-orquesta/reservas?estado=pendiente`.
4. [ ] `pages/orquesta/PerfilOrquesta.jsx`: `GET/PUT /mi-orquesta`.
5. [ ] `pages/admin/Admin.jsx`: los tres listados y el botón de verificar.

---

### Paso 12 — Cierre del MVP

1. [ ] Recorre a mano el flujo completo con tres cuentas (orquesta, usuario y admin).
2. [ ] Revisa los mensajes de error que ve el usuario en el frontend. 🆕 En los tres idiomas.
3. [ ] 🆕 Prueba en el móvil (o con las herramientas de desarrollo del navegador a 390 px de
       ancho) y en modo oscuro: las pantallas ya están preparadas, pero los datos reales pueden
       traer textos más largos que los de ejemplo.
4. [ ] Todos los tests pasan.
5. [ ] Actualiza el SPEC con cualquier decisión tomada por el camino.
