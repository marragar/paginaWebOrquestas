# SPEC — Plataforma de contratación de orquestas (MVP)

> Documento de especificación del proyecto. Es la referencia para el desarrollo con Claude Code:
> cualquier funcionalidad nueva se añade aquí antes de implementarse.

## 1. Objetivo

Plataforma web donde ayuntamientos, juntas vecinales, comisiones de fiestas y otros organizadores
pueden encontrar orquestas y reservar fechas en las que estén disponibles.

El MVP cubre solo el flujo básico: **la orquesta publica fechas libres → el usuario solicita una
fecha → la orquesta acepta o rechaza**. Pagos, precios y demás quedan fuera (ver sección 8).

## 2. Roles

| Rol | Quién es | Qué puede hacer |
|-----|----------|-----------------|
| `ORQUESTA` | Una orquesta (una cuenta por orquesta) | Gestionar su perfil, publicar/retirar fechas disponibles, aceptar/rechazar solicitudes |
| `USUARIO` | Organizador: ayuntamiento, junta vecinal, comisión de fiestas, particular | Buscar orquestas y fechas, solicitar reservas, cancelar sus solicitudes |
| `ADMIN` | Gestor de la plataforma | Validar orquestas, gestionar usuarios, ver todas las reservas |

- El registro público permite elegir entre `ORQUESTA` y `USUARIO`.
- Las cuentas `ADMIN` no se registran desde la web: se crean con un script/comando (seed).
- Una orquesta recién registrada queda **pendiente de validación** y no aparece en búsquedas
  hasta que un admin la aprueba.

## 3. Modelo de datos

### usuario
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| email | varchar | único |
| password_hash | varchar | bcrypt |
| rol | enum | `ORQUESTA`, `USUARIO`, `ADMIN` |
| activo | bool | el admin puede desactivar cuentas |
| creado_en | timestamp | |

### perfil_orquesta (1:1 con usuario de rol ORQUESTA)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| usuario_id | FK usuario | único |
| nombre | varchar | |
| descripcion | text | |
| provincia | varchar | |
| telefono_contacto | varchar | |
| validada | bool | false hasta que la aprueba un admin |

### perfil_contratante (1:1 con usuario de rol USUARIO)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| usuario_id | FK usuario | único |
| nombre_entidad | varchar | p. ej. "Junta Vecinal de X" |
| tipo_entidad | enum | `AYUNTAMIENTO`, `JUNTA_VECINAL`, `COMISION_FIESTAS`, `PARTICULAR`, `OTRO` |
| localidad | varchar | |
| provincia | varchar | |
| telefono_contacto | varchar | |

### disponibilidad
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| orquesta_id | FK perfil_orquesta | |
| fecha | date | |
| estado | enum | `LIBRE`, `PENDIENTE`, `RESERVADA` |

- Restricción única `(orquesta_id, fecha)`: una orquesta tiene como máximo una entrada por día.

### reserva
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| disponibilidad_id | FK disponibilidad | |
| contratante_id | FK perfil_contratante | |
| localidad_evento | varchar | dónde se toca |
| hora_aproximada | time | opcional |
| notas | text | opcional |
| estado | enum | `PENDIENTE`, `ACEPTADA`, `RECHAZADA`, `CANCELADA` |
| creado_en / actualizado_en | timestamp | |

## 4. Reglas de negocio

1. Solo se pueden publicar y solicitar **fechas futuras**.
2. Una fecha solo admite **una reserva activa** (`PENDIENTE` o `ACEPTADA`) a la vez.
3. Al solicitar una fecha `LIBRE`, la disponibilidad pasa a `PENDIENTE`.
4. Si la orquesta **acepta**, reserva → `ACEPTADA` y disponibilidad → `RESERVADA`.
5. Si la orquesta **rechaza** o el usuario **cancela**, la disponibilidad vuelve a `LIBRE`.
6. La orquesta **no puede borrar** una fecha con reserva `PENDIENTE` o `ACEPTADA`.
7. Las orquestas no validadas y las cuentas inactivas no aparecen en búsquedas.
8. Dos solicitudes simultáneas sobre la misma fecha: solo una puede tener éxito
   (se garantiza a nivel de base de datos, no solo en código).

## 5. API (borrador)

Autenticación con JWT. Prefijo `/api`.

**Auth**
- `POST /auth/registro` — crea usuario + perfil según rol
- `POST /auth/login` — devuelve token
- `GET  /auth/me` — datos del usuario autenticado

**Orquestas (público / usuario)**
- `GET /orquestas` — listado de orquestas validadas (filtros: provincia, fecha libre)
- `GET /orquestas/{id}` — perfil de una orquesta
- `GET /orquestas/{id}/disponibilidad?desde=&hasta=` — fechas libres

**Zona orquesta** (rol ORQUESTA)
- `GET/PUT /mi-orquesta` — ver/editar perfil
- `GET /mi-orquesta/disponibilidad` — todas sus fechas con estado
- `POST /mi-orquesta/disponibilidad` — añadir una o varias fechas
- `DELETE /mi-orquesta/disponibilidad/{id}` — retirar fecha (si no tiene reserva activa)
- `GET /mi-orquesta/reservas` — solicitudes recibidas
- `POST /mi-orquesta/reservas/{id}/aceptar`
- `POST /mi-orquesta/reservas/{id}/rechazar`

**Zona usuario** (rol USUARIO)
- `GET/PUT /mi-perfil`
- `POST /reservas` — solicitar una fecha
- `GET /reservas` — mis solicitudes
- `POST /reservas/{id}/cancelar`

**Admin** (rol ADMIN)
- `GET /admin/orquestas?validada=false` — orquestas pendientes
- `POST /admin/orquestas/{id}/validar`
- `GET /admin/usuarios` / `PATCH /admin/usuarios/{id}` — activar/desactivar
- `GET /admin/reservas` — todas las reservas

## 6. Pantallas

**Públicas:** inicio, login, registro (elección de rol), listado de orquestas, ficha de orquesta con calendario.

**Orquesta:** panel con calendario (marcar/desmarcar fechas libres), lista de solicitudes con aceptar/rechazar, edición de perfil.

**Usuario:** formulario de solicitud desde la ficha de la orquesta, "mis reservas" con estado y opción de cancelar, edición de perfil.

**Admin:** orquestas pendientes de validar, gestión de usuarios, listado global de reservas.

## 7. Stack

- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL, tests con pytest
- Frontend: React + Vite
- Infraestructura: Docker Compose (db, backend, frontend)
- Estructura: monorepo con `/backend`, `/frontend`, `docker-compose.yml`

## 8. Fuera del MVP (futuro)

- Pagos y señal de reserva
- Precios / presupuestos por fecha y negociación
- Notificaciones por email
- Valoraciones y reseñas
- Fotos, vídeos y ficha técnica de la orquesta (escenario, potencia, nº de músicos)
- Mensajería entre usuario y orquesta
- Varias actuaciones en un mismo día

## 9. Decisiones abiertas

- [ ] ¿La reserva requiere aceptación de la orquesta (propuesto) o es inmediata?
- [ ] ¿Las solicitudes pendientes caducan si la orquesta no responde en X días?
- [ ] ¿El usuario tiene que ser validado por el admin igual que la orquesta?
