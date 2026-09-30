# SPEC — Plataforma de contratación de orquestas (MVP)

> Documento de especificación del proyecto. Es la referencia para el desarrollo con Claude Code:
> cualquier funcionalidad nueva se añade aquí antes de implementarse.

## 1. Objetivo

Plataforma web donde ayuntamientos, juntas vecinales, comisiones de fiestas y otros organizadores
pueden encontrar orquestas y reservar fechas en las que estén disponibles.

El MVP cubre solo el flujo básico: **la orquesta publica fechas libres → los usuarios solicitan
una fecha → la orquesta acepta una solicitud (y las demás se rechazan)**. Los pagos quedan fuera
(ver sección 8).

## 2. Tipos de cuenta

Hay **dos tipos de cuenta separados**, cada uno en su propia tabla y con su propio login
(en la web: «Organizo fiestas» para la cuenta de usuario y «Tengo una orquesta» para la de
orquesta; en el código y en la API se siguen llamando `usuario` y `orquesta`):

| Cuenta | Quién es | Qué puede hacer |
|--------|----------|-----------------|
| **Usuario** | Organizador: ayuntamiento, junta vecinal, comisión de fiestas, particular | Buscar orquestas y fechas, solicitar reservas, cancelar sus solicitudes |
| **Orquesta** | Una orquesta (una cuenta por orquesta) | Gestionar su perfil, publicar/bloquear/retirar fechas, aceptar/rechazar solicitudes |
| **Admin** | Un *usuario* con `es_admin = true` | Verificar orquestas, ver usuarios y todas las reservas |

- El registro público permite crear una cuenta de usuario o de orquesta.
- Un **email no puede repetirse entre usuarios y orquestas** (se comprueba en ambas tablas al registrar).
- Los admin entran por el login de usuario. No se registran desde la web: se crean con un script
  o se marca `es_admin = true` a un usuario existente.
- Una orquesta recién registrada queda **sin verificar** y no aparece en búsquedas hasta que un
  admin la verifica.

## 3. Modelo de datos

### usuarios
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | autoincremental |
| email | varchar | único, obligatorio |
| password_hash | varchar | obligatorio, bcrypt (nunca la contraseña en claro) |
| nombre | varchar | obligatorio, p. ej. "Junta Vecinal de X" |
| tipo | enum | `ayuntamiento`, `junta_vecinal`, `comision_fiestas`, `particular` (obligatorio) |
| cif | varchar | opcional |
| municipio | varchar | opcional |
| provincia | varchar | opcional |
| telefono | varchar | opcional |
| es_admin | bool | por defecto `false` |
| creado_en | timestamp | por defecto ahora |

### orquestas
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | autoincremental |
| email | varchar | único, obligatorio |
| password_hash | varchar | obligatorio |
| nombre | varchar | obligatorio |
| descripcion | text | opcional |
| provincia | varchar | obligatorio |
| num_musicos | int | opcional |
| precio_base | decimal | opcional |
| telefono | varchar | obligatorio |
| verificada | bool | por defecto `false`, la cambia un admin |
| creado_en | timestamp | por defecto ahora |

### disponibilidades
Los días que cada orquesta ofrece. Una fila por orquesta y día.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | autoincremental |
| orquesta_id | FK orquestas | obligatorio |
| fecha | date | obligatorio |
| estado | enum | `libre`, `reservada`, `bloqueada`, `retirada` (borrado lógico, §4.9) |
| precio | decimal | obligatorio |
| notas | text | opcional |

- Restricción única `(orquesta_id, fecha)`: una orquesta tiene como máximo una disponibilidad por día.

### reservas
Solicitudes de un usuario sobre una disponibilidad.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | autoincremental |
| disponibilidad_id | FK disponibilidades | obligatorio |
| usuario_id | FK usuarios | obligatorio |
| estado | enum | `pendiente`, `aceptada`, `rechazada`, `cancelada` |
| lugar | varchar | opcional, dónde se toca |
| hora_inicio | time | opcional |
| mensaje | text | opcional |
| creado_en | timestamp | por defecto ahora |

- Índice único **parcial** sobre `disponibilidad_id` donde `estado = 'aceptada'`:
  como mucho una reserva aceptada por disponibilidad.

### Relaciones (todas 1:N)
- Una orquesta tiene muchas disponibilidades.
- Un usuario tiene muchas reservas.
- Una disponibilidad puede recibir varias reservas (varios pueblos pueden pedir el mismo día),
  pero solo una puede estar aceptada.

## 4. Reglas de negocio

1. Solo se pueden publicar y solicitar **fechas futuras**.
2. Solo se pueden solicitar disponibilidades en estado `libre`. Una disponibilidad `libre` puede
   tener **varias reservas `pendiente`** a la vez.
3. Un mismo usuario no debería tener dos reservas `pendiente` sobre la misma disponibilidad.
4. Cuando la orquesta **acepta** una reserva, en una sola transacción:
   - la reserva pasa a `aceptada`,
   - la disponibilidad pasa a `reservada`,
   - el resto de reservas `pendiente` de esa disponibilidad pasan a `rechazada`.
5. **Solo una reserva aceptada por disponibilidad**: se controla en el backend dentro de la
   transacción y además con el índice único parcial (dos aceptaciones simultáneas: solo una tiene éxito).
6. Si la orquesta **rechaza** una reserva, la disponibilidad no cambia.
7. Si el usuario **cancela** una reserva `aceptada`, la disponibilidad vuelve a `libre`.
   Cancelar una `pendiente` no cambia la disponibilidad.
8. La orquesta puede marcar un día como `bloqueada` (no disponible, sin reservas). Un día
   bloqueado no se puede solicitar. Al bloquear un día `libre`, sus reservas `pendiente` pasan a
   `rechazada` en la misma transacción (igual que al retirar, §4.9): si no, quedarían esperando
   en un día que ya no se puede aceptar. Desbloquear no las recupera.
9. Las fechas **no se borran de la BD: se retiran** (borrado lógico). Retirar pasa la
   disponibilidad a `retirada`, así sus reservas conservan la fecha y el organizador las sigue
   viendo en «Mis reservas». Al retirar:
   - si la fecha está `reservada` (tiene una reserva `aceptada`) → 409 `fecha_con_reserva`;
   - sus reservas `pendiente` pasan a `rechazada`;
   - una fecha `retirada` no aparece en ningún listado (tampoco en el calendario de la orquesta)
     y no se puede modificar: para la orquesta es como si no existiera (404 `no_encontrado`).
10. Las orquestas no verificadas no aparecen en búsquedas.
11. Un email no puede existir a la vez en `usuarios` y `orquestas`.
12. 🆕 Bloquear un día que no tiene disponibilidad crea la fila directamente con estado
    `bloqueada` (el calendario de la orquesta permite bloquear cualquier día futuro).
13. 🆕 Las operaciones sobre varias fechas (`POST`, `PATCH` y `DELETE` de
    `/mi-orquesta/disponibilidad`) se hacen en **una sola transacción**: si una fecha falla, no se
    aplica ninguna y el error indica cuál (`fecha` o `id` en el `detail`).
14. 🆕 No se puede bloquear una fecha `reservada` (mismo error que §4.9: `fecha_con_reserva`).
15. 🆕 Publicar o bloquear un día que tiene una fila `retirada` **reutiliza esa fila** (pasa a
    `libre` o `bloqueada` con el precio nuevo) en vez de crear otra: la restricción única
    `(orquesta_id, fecha)` sigue contando las retiradas. Por eso `fecha_duplicada` solo salta si
    la fila existente no está `retirada`.

## 5. API (borrador)

Autenticación con JWT. El token indica el **tipo de cuenta** (`usuario` u `orquesta`) y su id.
Prefijo `/api`. Los endpoints marcados con 🆕 o con cambios (✏️) salen de las necesidades del
frontend (ver §5.2 y §6).

**Auth**
- `POST /auth/usuarios/registro` — crea un usuario
- `POST /auth/usuarios/login` — login de usuario (también admins)
- `POST /auth/orquestas/registro` — crea una orquesta (sin verificar)
- `POST /auth/orquestas/login` — login de orquesta
- `GET  /auth/me` ✏️ — datos de la cuenta autenticada **y su rol** (`usuario`, `orquesta` o `admin`),
  para que el frontend sepa qué menú mostrar

**Orquestas (público)**
- `GET /orquestas` ✏️ — listado de orquestas verificadas (filtros: `provincia`, `fecha` libre).
  Cada orquesta incluye sus **próximas fechas libres** (`proximas_libres`, máximo 5) para que el
  listado no tenga que hacer una petición por orquesta
- `GET /orquestas/{id}` — perfil de una orquesta (incluye `telefono`: la ficha tiene botón «Llamar»)
- `GET /orquestas/{id}/disponibilidad?desde=&hasta=` — fechas libres
- 🆕 `GET /disponibilidades/proximas?limite=6` — próximas fechas libres de todas las orquestas
  verificadas, con los datos básicos de la orquesta (portada: «Días libres más cercanos»)

**Zona orquesta** (cuenta orquesta)
- `GET/PUT /mi-orquesta` — ver/editar perfil (el email no se puede cambiar)
- `GET /mi-orquesta/disponibilidad` — todas sus fechas con estado, menos las `retirada`
- `POST /mi-orquesta/disponibilidad` ✏️ — añadir **una o varias** fechas de golpe, con `estado`
  `libre` o `bloqueada` y su `precio` (el panel permite marcar varios días y publicarlos o
  bloquearlos a la vez)
- `PATCH /mi-orquesta/disponibilidad/{id}` — cambiar precio, notas o bloquear/desbloquear
- 🆕 `PATCH /mi-orquesta/disponibilidad` — lo mismo para **varias** fechas a la vez
  (`{ "ids": [...], "estado"?: ..., "precio"?: ... }`). Se aplica todo o nada
- `DELETE /mi-orquesta/disponibilidad/{id}` — retirar fecha (regla §4.9: no borra la fila, la
  pasa a `retirada`)
- 🆕 `DELETE /mi-orquesta/disponibilidad?ids=1,2,3` — retirar varias. Todo o nada: si alguna tiene
  reserva aceptada, no se retira ninguna y se devuelve el error `fecha_con_reserva`
- `GET /mi-orquesta/reservas` ✏️ — solicitudes recibidas. Filtro opcional `estado`
  (`?estado=pendiente` sirve para el aviso con el número de solicitudes sin responder). Cada
  solicitud incluye los datos del organizador que pide (nombre, tipo, municipio, provincia,
  teléfono) y la fecha
- `POST /mi-orquesta/reservas/{id}/aceptar` ✏️ — regla §4.4. La respuesta incluye cuántas
  solicitudes se han rechazado automáticamente (`rechazadas`), porque el frontend lo muestra
- `POST /mi-orquesta/reservas/{id}/rechazar`

**Zona usuario** (cuenta usuario)
- `GET/PUT /mi-perfil` — el email no se puede cambiar
- `POST /reservas` — solicitar una fecha (`disponibilidad_id`, `lugar`, `hora_inicio`, `mensaje`)
- `GET /reservas` ✏️ — mis solicitudes. Filtro opcional `estado`. Cada una incluye la fecha, el
  precio final y la orquesta (nombre y teléfono: «Mis reservas» tiene botón «Llamar»)
- `POST /reservas/{id}/cancelar`

**Admin** (usuario con `es_admin`)
- `GET /admin/orquestas?verificada=false` — orquestas pendientes
- `POST /admin/orquestas/{id}/verificar`
- `GET /admin/usuarios`
- `GET /admin/reservas` ✏️ — todas las reservas, con fecha, orquesta, organizador y precio final.
  Filtro opcional `estado`

### 5.1 Convenciones de la API

**Los textos los pone el frontend, no la API.** La web está en español, inglés y gallego (§6), así
que la API nunca devuelve frases para mostrar:
- Estados y tipos se devuelven con su **valor del enum** (`pendiente`, `libre`, `junta_vecinal`…),
  exactamente los de §3. El frontend los traduce.
- Fechas en ISO: `"2026-10-10"` para `date`, `"23:00"` para `time`, ISO 8601 con zona horaria para
  `creado_en`. El frontend las formatea según el idioma.
- **Errores con código estable.** Todos los errores de negocio devuelven:

  ```json
  { "detail": { "codigo": "email_repetido", "mensaje": "El email ya está registrado" } }
  ```

  El frontend traduce el `codigo`; `mensaje` es solo para quien depura (en español). Códigos
  previstos:

  | Código | HTTP | Cuándo |
  |---|---|---|
  | `credenciales_incorrectas` | 401 | login con email o contraseña mal |
  | `no_autenticado` | 401 | falta el token o ha caducado |
  | `sin_permiso` | 403 | el token es de otro tipo de cuenta o no es admin |
  | `email_repetido` | 409 | §4.11, en usuarios **o** en orquestas |
  | `no_encontrado` | 404 | el recurso no existe o no es de esa cuenta |
  | `fecha_pasada` | 422 | §4.1 |
  | `fecha_duplicada` | 409 | la orquesta ya tiene esa fecha (restricción única) |
  | `fecha_no_libre` | 409 | §4.2 y §4.8: se pide una fecha reservada o bloqueada |
  | `solicitud_duplicada` | 409 | §4.3 |
  | `fecha_con_reserva` | 409 | §4.9: retirar o bloquear una fecha con reserva aceptada |
  | `ya_aceptada` | 409 | §4.5: otra reserva de esa fecha se aceptó antes |
  | `estado_no_valido` | 409 | acción que no encaja con el estado (p. ej. aceptar una cancelada) |

- Los errores de validación de Pydantic (422 estándar de FastAPI) se dejan como están: el frontend
  valida los formularios antes de enviarlos.

**Precios como número.** `precio` y `precio_base` se guardan como `Numeric(10, 2)`, pero en JSON se
devuelven como número (`6500.0`), no como texto. Ojo: Pydantic v2 serializa `Decimal` como string
por defecto; hay que declararlos como `float` en los schemas de salida o añadir un serializador.

**Precio final.** Toda respuesta que incluya una disponibilidad lleva también `precio_final`
(= `precio` de la disponibilidad, que es obligatorio; se mantiene el nombre porque el frontend ya
lo usa).

**Nunca se devuelve `password_hash`.** Tampoco el email de los organizadores en rutas públicas.

**Validaciones mínimas** (las mismas que avisa el frontend):
- `password`: mínimo 8 caracteres y máximo 72 bytes (límite de bcrypt; una «ñ» ocupa 2).
- `email`: formato válido (`EmailStr`).
- `telefono`: hasta 20 caracteres (el frontend genera el enlace `tel:` quitando espacios).

### 5.2 Forma de las respuestas que usa el frontend

Los datos de ejemplo del frontend (`frontend/src/datos/demo.js`) tienen esta forma. Si la API
devuelve lo mismo, cambiar los datos de ejemplo por llamadas reales será directo.

```jsonc
// GET /auth/me
{ "rol": "orquesta", "cuenta": { "id": 1, "nombre": "…", "email": "…", /* …resto del perfil */ } }

// GET /orquestas  (lista)
{ "id": 1, "nombre": "…", "descripcion": "…", "provincia": "León", "num_musicos": 14,
  "precio_base": 6500.0, "telefono": "987 123 456",
  "proximas_libres": [ { "id": 101, "fecha": "2026-10-10", "precio_final": 6500.0 } ] }

// GET /disponibilidades/proximas
{ "id": 101, "fecha": "2026-10-10", "precio_final": 6500.0,
  "orquesta": { "id": 1, "nombre": "…", "provincia": "León", "num_musicos": 14 } }

// GET /mi-orquesta/reservas
{ "id": 1, "estado": "pendiente", "lugar": "…", "hora_inicio": "23:00", "mensaje": "…",
  "creado_en": "2026-09-20T10:00:00+02:00",
  "disponibilidad": { "id": 101, "fecha": "2026-10-10", "estado": "libre", "precio_final": 6500.0 },
  "usuario": { "id": 1, "nombre": "…", "tipo": "ayuntamiento", "municipio": "Astorga",
               "provincia": "León", "telefono": "987 618 850" } }

// GET /reservas  (del usuario)
{ "id": 1, "estado": "aceptada", "lugar": "…", "hora_inicio": "22:00", "mensaje": "…",
  "creado_en": "…",
  "disponibilidad": { "id": 108, "fecha": "2026-11-14", "precio_final": 6500.0 },
  "orquesta": { "id": 1, "nombre": "…", "telefono": "987 123 456" } }

// POST /mi-orquesta/reservas/{id}/aceptar
{ "reserva": { /* como en GET /mi-orquesta/reservas */ }, "rechazadas": 1 }
```

## 6. Pantallas

Maquetadas en el frontend con datos de ejemplo (`frontend/src/datos/demo.js`). La web es
responsive (móvil, tablet y escritorio), tiene modo claro/oscuro y está en **español, inglés y
gallego**. El idioma y el tema los guarda el navegador; el backend no necesita saber nada de ellos
(ver §8 para cuando haya emails).

| Ruta | Pantalla | Endpoints |
|---|---|---|
| `/` | Inicio: buscador, próximas fechas libres | `GET /disponibilidades/proximas` |
| `/entrar`, `/registro` | Elección «Organizo fiestas» / «Tengo una orquesta» | `/auth/...` |
| `/orquestas` | Listado con filtros de provincia y día libre | `GET /orquestas` |
| `/orquestas/:id` | Ficha con calendario, «Llamar», «Compartir por WhatsApp» y solicitud | `GET /orquestas/{id}`, `GET /orquestas/{id}/disponibilidad`, `POST /reservas` |
| `/mis-reservas` | Mis reservas con estado, «Llamar» y cancelar | `GET /reservas`, `POST /reservas/{id}/cancelar` |
| `/mi-perfil` | Perfil del organizador | `GET/PUT /mi-perfil` |
| `/mi-orquesta/calendario` | Calendario con selección múltiple: publicar, bloquear, desbloquear, cambiar precio, retirar | `GET/POST/PATCH/DELETE /mi-orquesta/disponibilidad` |
| `/mi-orquesta/solicitudes` | Solicitudes agrupadas por día, aceptar/rechazar, «Llamar» | `GET /mi-orquesta/reservas`, `POST …/aceptar`, `POST …/rechazar` |
| `/mi-orquesta/perfil` | Perfil de la orquesta | `GET/PUT /mi-orquesta` |
| `/admin/orquestas` | Orquestas por verificar | `GET /admin/orquestas?verificada=false`, `POST …/verificar` |
| `/admin/usuarios` | Organizadores | `GET /admin/usuarios` |
| `/admin/reservas` | Todas las reservas con filtro por estado | `GET /admin/reservas` |

El aviso con el número de solicitudes sin responder (cabecera de la orquesta) usa
`GET /mi-orquesta/reservas?estado=pendiente`.

## 7. Stack

- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL, tests con pytest
- Frontend: React + Vite
- Infraestructura: Docker Compose (db, backend, frontend)
- Estructura: monorepo con `/backend`, `/frontend`, `docker-compose.yml`

## 8. Fuera del MVP (futuro)

- Pagos y señal de reserva
- Presupuestos personalizados y negociación de precio
- Desactivar cuentas (no hay campo `activo` en el modelo actual)
- Notificaciones por email (cuando existan, hará falta guardar el idioma de cada cuenta:
  columna `idioma` con `es`, `en` o `gl` en `usuarios` y `orquestas`, para escribir en su idioma)
- Valoraciones y reseñas
- Fotos, vídeos y ficha técnica de la orquesta (escenario, potencia...)
- Mensajería entre usuario y orquesta
- Varias actuaciones en un mismo día

## 9. Decisiones abiertas

- [x] ¿La reserva requiere aceptación de la orquesta? → Sí.
- [x] ¿El usuario tiene que ser validado por el admin? → No, solo las orquestas.
- [ ] ¿Las solicitudes pendientes caducan si la orquesta no responde en X días?
- [x] ¿Qué pasa con las reservas pendientes si la orquesta borra la fecha? → No se borra: se
  retira (borrado lógico) y las pendientes pasan a `rechazada` (§4.9).
- [x] ¿Y si la orquesta **bloquea** una fecha con reservas pendientes? → Se rechazan
  automáticamente, como al retirar (§4.8).
- [ ] ¿El usuario puede cancelar una reserva aceptada en cualquier momento o hay un plazo?
- [ ] El modelo `Orquesta` tiene un campo `tipo` (`orquesta_directo` / `orquesta_playback`) que no
  está en §3 ni en el frontend. ¿Se mantiene? Si se mantiene, hay que añadirlo a §3, al registro
  de orquesta y a la ficha; si no, quitarlo con una migración.
- [ ] `precio` de la disponibilidad es obligatorio, pero el panel de la orquesta deja publicar
  días sin precio (muestra `precio_base` como sugerencia) y bloquear días sin fila (§4.12). ¿Qué
  precio se guarda entonces: se copia `precio_base` (y entonces `precio_base` tendría que ser
  obligatorio) o se exige precio en el formulario?
- [ ] `telefono` de la orquesta es obligatorio, pero el formulario de registro de orquesta del
  frontend no lo pide: hay que añadirlo.
- [ ] ¿Límite de fechas por petición en las operaciones múltiples? (propuesta: 100)
