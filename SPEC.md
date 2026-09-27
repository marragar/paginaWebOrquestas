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
(acceso "Soy usuario" / "Soy orquesta"):

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
| provincia | varchar | opcional |
| num_musicos | int | opcional |
| precio_base | decimal | opcional |
| telefono | varchar | opcional |
| verificada | bool | por defecto `false`, la cambia un admin |
| creado_en | timestamp | por defecto ahora |

### disponibilidades
Los días que cada orquesta ofrece. Una fila por orquesta y día.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | autoincremental |
| orquesta_id | FK orquestas | obligatorio |
| fecha | date | obligatorio |
| estado | enum | `libre`, `reservada`, `bloqueada` |
| precio | decimal | opcional (si no, se aplica `precio_base` de la orquesta) |
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
   bloqueado no se puede solicitar.
9. La orquesta **no puede borrar** una disponibilidad con reserva `aceptada`.
   (Si tiene pendientes: ver decisiones abiertas.)
10. Las orquestas no verificadas no aparecen en búsquedas.
11. Un email no puede existir a la vez en `usuarios` y `orquestas`.

## 5. API (borrador)

Autenticación con JWT. El token indica el **tipo de cuenta** (`usuario` u `orquesta`) y su id.
Prefijo `/api`.

**Auth**
- `POST /auth/usuarios/registro` — crea un usuario
- `POST /auth/usuarios/login` — login de usuario (también admins)
- `POST /auth/orquestas/registro` — crea una orquesta (sin verificar)
- `POST /auth/orquestas/login` — login de orquesta
- `GET  /auth/me` — datos de la cuenta autenticada (usuario u orquesta)

**Orquestas (público)**
- `GET /orquestas` — listado de orquestas verificadas (filtros: provincia, fecha libre)
- `GET /orquestas/{id}` — perfil de una orquesta
- `GET /orquestas/{id}/disponibilidad?desde=&hasta=` — fechas libres

**Zona orquesta** (cuenta orquesta)
- `GET/PUT /mi-orquesta` — ver/editar perfil
- `GET /mi-orquesta/disponibilidad` — todas sus fechas con estado
- `POST /mi-orquesta/disponibilidad` — añadir una o varias fechas
- `PATCH /mi-orquesta/disponibilidad/{id}` — cambiar precio, notas o bloquear/desbloquear
- `DELETE /mi-orquesta/disponibilidad/{id}` — retirar fecha (regla §4.9)
- `GET /mi-orquesta/reservas` — solicitudes recibidas
- `POST /mi-orquesta/reservas/{id}/aceptar` — regla §4.4
- `POST /mi-orquesta/reservas/{id}/rechazar`

**Zona usuario** (cuenta usuario)
- `GET/PUT /mi-perfil`
- `POST /reservas` — solicitar una fecha
- `GET /reservas` — mis solicitudes
- `POST /reservas/{id}/cancelar`

**Admin** (usuario con `es_admin`)
- `GET /admin/orquestas?verificada=false` — orquestas pendientes
- `POST /admin/orquestas/{id}/verificar`
- `GET /admin/usuarios`
- `GET /admin/reservas` — todas las reservas

## 6. Pantallas

**Públicas:** inicio, login (elección "Soy usuario" / "Soy orquesta"), registro (misma elección),
listado de orquestas, ficha de orquesta con calendario.

**Orquesta:** panel con calendario (añadir, bloquear y retirar fechas), lista de solicitudes con
aceptar/rechazar, edición de perfil.

**Usuario:** formulario de solicitud desde la ficha de la orquesta, "mis reservas" con estado y
opción de cancelar, edición de perfil.

**Admin:** orquestas pendientes de verificar, listado de usuarios, listado global de reservas.

## 7. Stack

- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL, tests con pytest
- Frontend: React + Vite
- Infraestructura: Docker Compose (db, backend, frontend)
- Estructura: monorepo con `/backend`, `/frontend`, `docker-compose.yml`

## 8. Fuera del MVP (futuro)

- Pagos y señal de reserva
- Presupuestos personalizados y negociación de precio
- Desactivar cuentas (no hay campo `activo` en el modelo actual)
- Notificaciones por email
- Valoraciones y reseñas
- Fotos, vídeos y ficha técnica de la orquesta (escenario, potencia...)
- Mensajería entre usuario y orquesta
- Varias actuaciones en un mismo día

## 9. Decisiones abiertas

- [x] ¿La reserva requiere aceptación de la orquesta? → Sí.
- [x] ¿El usuario tiene que ser validado por el admin? → No, solo las orquestas.
- [ ] ¿Las solicitudes pendientes caducan si la orquesta no responde en X días?
- [ ] ¿Qué pasa con las reservas pendientes si la orquesta borra o bloquea la fecha? (¿se rechazan automáticamente o se impide la acción?)
- [ ] ¿El usuario puede cancelar una reserva aceptada en cualquier momento o hay un plazo?
