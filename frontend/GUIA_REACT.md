# Guía de React para quien viene de HTML, CSS y JavaScript

Esta guía explica lo necesario para programar el frontend de este proyecto. Da por hecho que ya
sabes HTML, CSS y JavaScript "de toda la vida" (`document.querySelector`, `addEventListener`,
`fetch`...). Cada concepto se compara con cómo lo harías sin React.

Documentación oficial (muy buena y en parte en español): https://es.react.dev/learn

---

## 1. La idea principal: describir, no manipular

Con JavaScript normal **modificas el DOM a mano**:

```js
const lista = document.querySelector('#lista')
orquestas.forEach((o) => {
  const li = document.createElement('li')
  li.textContent = o.nombre
  lista.appendChild(li)
})
// ...y si cambian los datos, tienes que acordarte de borrar y volver a pintar
```

Con React **describes cómo debe verse la página según los datos**, y React se encarga de
actualizar el DOM cuando los datos cambian:

```jsx
<ul>
  {orquestas.map((o) => <li key={o.id}>{o.nombre}</li>)}
</ul>
```

Regla de oro: **en React casi nunca usarás `document.querySelector` ni tocarás el DOM
directamente.** Si cambias los datos (el *estado*), la vista se actualiza sola.

---

## 2. Cómo arranca la aplicación

```
index.html          → tiene un único <div id="root"></div>
  └ src/main.jsx    → le dice a React: "pinta <App /> dentro de #root"
      └ src/App.jsx → decide qué página mostrar según la URL
          └ src/pages/Inicio.jsx, ...
```

Solo hay **un** HTML. Todas las "páginas" son componentes de React que se intercambian sin
recargar el navegador (esto se llama *SPA*, Single Page Application).

**Vite** es la herramienta que sirve los ficheros en desarrollo (`npm run dev`), recarga al guardar
y genera la versión final (`npm run build`). No tienes que configurarlo.

---

## 3. JSX: HTML dentro de JavaScript

Los ficheros `.jsx` permiten escribir algo parecido a HTML dentro de JavaScript. Diferencias
con el HTML normal:

| HTML | JSX | Por qué |
|------|-----|---------|
| `class="caja"` | `className="caja"` | `class` es palabra reservada en JS |
| `for="email"` | `htmlFor="email"` | igual, `for` es reservada |
| `<br>`, `<img src="">` | `<br />`, `<img src="" />` | todas las etiquetas se cierran |
| `onclick="hacer()"` | `onClick={hacer}` | eventos en camelCase y se pasa la función |
| `style="color: red; font-size: 12px"` | `style={{ color: 'red', fontSize: 12 }}` | es un objeto JS |
| `<!-- comentario -->` | `{/* comentario */}` | |

**Las llaves `{}` meten JavaScript dentro del JSX:**

```jsx
const nombre = 'Orquesta Pontevedra'
const fechas = 12

return (
  <div>
    <h2>{nombre}</h2>
    <p>Tiene {fechas} fechas libres</p>
    <p>{fechas > 0 ? 'Disponible' : 'Sin fechas'}</p>
  </div>
)
```

Dentro de `{}` solo caben **expresiones** (algo que devuelve un valor): variables, llamadas,
ternarios `? :`, `map`... No caben `if`, `for` ni `let x = ...`.

Un componente debe devolver **un único elemento raíz**. Si no quieres un `<div>` extra, usa un
fragmento vacío `<> ... </>`.

---

## 4. Componentes

Un componente es **una función que devuelve JSX**. Su nombre empieza por mayúscula.

```jsx
function TarjetaOrquesta() {
  return (
    <article className="tarjeta">
      <h3>Orquesta de ejemplo</h3>
      <p>León</p>
    </article>
  )
}
```

Y se usa como si fuera una etiqueta HTML nueva:

```jsx
<TarjetaOrquesta />
```

Es como crear tus propias etiquetas. En este proyecto:
- `src/pages/` → componentes que son una pantalla completa.
- `src/components/` → piezas reutilizables (tarjetas, botones, calendario...).

Para usar un componente de otro fichero, se exporta y se importa (módulos de JS):

```jsx
// components/TarjetaOrquesta.jsx
export default function TarjetaOrquesta() { ... }

// pages/Orquestas.jsx
import TarjetaOrquesta from '../components/TarjetaOrquesta.jsx'
```

---

## 5. Props: pasar datos a un componente

Las *props* son como los atributos de HTML: permiten que un componente reciba datos.

```jsx
function TarjetaOrquesta({ nombre, provincia }) {
  return (
    <article className="tarjeta">
      <h3>{nombre}</h3>
      <p>{provincia}</p>
    </article>
  )
}

// uso
<TarjetaOrquesta nombre="Orquesta Pontevedra" provincia="Pontevedra" />
<TarjetaOrquesta nombre="La Gran Banda" provincia="León" />
```

`{ nombre, provincia }` es *desestructuración*: equivale a recibir un objeto `props` y leer
`props.nombre` y `props.provincia`.

Las props son **de solo lectura**: un componente nunca modifica las props que recibe.

---

## 6. Estado: datos que cambian (`useState`)

Si un dato cambia con el tiempo (lo que escribe el usuario, datos que llegan del servidor, un
menú abierto/cerrado...), se guarda en **estado**.

```jsx
import { useState } from 'react'

function Contador() {
  const [cuenta, setCuenta] = useState(0)   // valor inicial 0

  return (
    <button onClick={() => setCuenta(cuenta + 1)}>
      Pulsado {cuenta} veces
    </button>
  )
}
```

- `cuenta` → el valor actual.
- `setCuenta(nuevoValor)` → cambia el valor **y hace que React vuelva a pintar el componente**.

Comparación con JS normal:

```js
// Sin React
let cuenta = 0
boton.addEventListener('click', () => {
  cuenta++
  boton.textContent = `Pulsado ${cuenta} veces`   // actualizas el DOM a mano
})
```

⚠️ Errores típicos:
- `cuenta = cuenta + 1` **no funciona**: hay que usar siempre `setCuenta`.
- Con arrays y objetos no los modifiques (`lista.push(x)`), crea uno nuevo:
  ```jsx
  setLista([...lista, nuevo])                       // añadir
  setLista(lista.filter((x) => x.id !== id))        // quitar
  setPerfil({ ...perfil, telefono: '600000000' })   // cambiar un campo
  ```
- Tras llamar a `setCuenta`, la variable `cuenta` **no cambia hasta el siguiente pintado**.

**Props vs estado:** las props vienen de fuera (el padre); el estado es del propio componente.
Si dos componentes necesitan el mismo dato, el estado se sube al padre común y se pasa por props.

---

## 7. Eventos

```jsx
function BotonCancelar({ onCancelar }) {
  return <button onClick={onCancelar}>Cancelar</button>
}
```

- Se pasa **la función**, no se llama: `onClick={hacer}` ✅ — `onClick={hacer()}` ❌ (se ejecutaría al pintar).
- Si necesitas pasar argumentos, envuélvela: `onClick={() => cancelar(reserva.id)}`.
- Un padre puede pasar funciones a sus hijos como props (`onCancelar` arriba), así el hijo
  "avisa" al padre de que ha pasado algo.

---

## 8. Listas

```jsx
<ul>
  {reservas.map((r) => (
    <li key={r.id}>
      {r.fecha} — {r.estado}
    </li>
  ))}
</ul>
```

Cada elemento de la lista necesita una prop `key` **única y estable** (normalmente el `id` de la
base de datos). React la usa para saber qué elemento ha cambiado. Si la olvidas, verás un
aviso en la consola del navegador.

---

## 9. Mostrar cosas según una condición

```jsx
{cargando && <p>Cargando...</p>}

{error ? <p className="error">{error}</p> : <ListaOrquestas orquestas={orquestas} />}

{usuario?.rol === 'ORQUESTA' && <Link to="/mi-orquesta">Mi panel</Link>}
```

- `condicion && <X />` → pinta `<X />` solo si la condición es verdadera.
- `condicion ? <A /> : <B />` → uno u otro.
- Para lógica más larga, usa un `if` **antes** del `return`:
  ```jsx
  if (cargando) return <p>Cargando...</p>
  return <div>...</div>
  ```

⚠️ Cuidado con `{lista.length && ...}`: si la longitud es 0, pinta un "0". Usa `lista.length > 0 && ...`.

---

## 10. Formularios (inputs controlados)

En React el valor de un input se guarda en estado y el input lo refleja:

```jsx
function FormLogin({ onEnviar }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()              // evita que el navegador recargue la página
    onEnviar({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">Contraseña</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button type="submit">Entrar</button>
    </form>
  )
}
```

Ventaja: en cualquier momento tienes los valores en variables, sin `document.querySelector('#email').value`.

Con muchos campos puedes usar un solo objeto y el atributo `name`:

```jsx
const [form, setForm] = useState({ nombre: '', provincia: '' })

function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value })
}

<input name="nombre" value={form.nombre} onChange={handleChange} />
<input name="provincia" value={form.provincia} onChange={handleChange} />
```

---

## 11. Cargar datos del servidor (`useEffect`)

El cuerpo de un componente se ejecuta **cada vez que se pinta**, así que no puedes hacer un
`fetch` ahí directamente (se repetiría sin fin). Para hacer algo *después* de pintar se usa
`useEffect`:

```jsx
import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

function ListaOrquestas() {
  const [orquestas, setOrquestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/orquestas')
      .then(setOrquestas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])   // ← array de dependencias

  if (cargando) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <ul>
      {orquestas.map((o) => <li key={o.id}>{o.nombre}</li>)}
    </ul>
  )
}
```

El **array de dependencias** (segundo argumento) indica cuándo se repite el efecto:

| Array | Cuándo se ejecuta |
|-------|-------------------|
| `[]` | solo una vez, al aparecer el componente |
| `[provincia]` | al aparecer y cada vez que cambie `provincia` (útil para filtros) |
| sin array | después de **cada** pintado (casi nunca lo quieres) |

`src/pages/Inicio.jsx` ya tiene un ejemplo real de este patrón.

Este patrón (estado `cargando` / `error` / datos) lo repetirás en casi todas las pantallas.

---

## 12. Navegación entre páginas (React Router)

Como solo hay un HTML, las "páginas" las gestiona `react-router-dom`. Ya está preparado en
`main.jsx` y `App.jsx`.

**Definir rutas** (en `App.jsx`):

```jsx
<Routes>
  <Route path="/" element={<Inicio />} />
  <Route path="/orquestas" element={<Orquestas />} />
  <Route path="/orquestas/:id" element={<FichaOrquesta />} />
  <Route path="*" element={<p>Página no encontrada</p>} />
</Routes>
```

**Enlaces:** usa `<Link>` en vez de `<a>` (un `<a>` recargaría la página entera y perderías el estado):

```jsx
import { Link } from 'react-router-dom'

<Link to={`/orquestas/${orquesta.id}`}>Ver ficha</Link>
```

**Leer parámetros de la URL** (`:id`):

```jsx
import { useParams } from 'react-router-dom'

function FichaOrquesta() {
  const { id } = useParams()
  // ... useEffect que carga /orquestas/{id}, con [id] como dependencia
}
```

**Ir a otra página desde código** (p. ej. tras hacer login):

```jsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
// ...
navigate('/mis-reservas')
```

**Parámetros de búsqueda** (`/orquestas?provincia=León`): `useSearchParams()`.

---

## 13. Datos compartidos por toda la app (Context)

Algunos datos los necesitan muchos componentes, como **el usuario que ha iniciado sesión**.
Pasarlos por props de padre a hijo a nieto... es incómodo. Para eso está el *Context*:

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  // aquí irán login(), logout(), cargar /auth/me al arrancar...

  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

Se envuelve la app con el *provider* (en `main.jsx`, alrededor de `<App />`) y cualquier
componente puede hacer:

```jsx
const { usuario } = useAuth()
```

`children` es una prop especial: lo que va entre la etiqueta de apertura y cierre del componente.

---

## 14. CSS en React

Lo más sencillo, y suficiente para este proyecto: ficheros `.css` normales importados desde el
componente.

```jsx
// src/components/TarjetaOrquesta.jsx
import './TarjetaOrquesta.css'
```

El CSS importado es **global** (afecta a toda la página), así que usa nombres de clase
concretos (`.tarjeta-orquesta` mejor que `.tarjeta`). Para estilos generales crea un
`src/index.css` e impórtalo en `main.jsx`.

Si más adelante quieres estilos aislados por componente, mira los *CSS Modules* (ficheros
`.module.css`), que Vite ya soporta sin configurar nada.

---

## 15. JavaScript moderno que vas a usar mucho

Si alguno te suena raro, repásalo antes de empezar; React lo usa constantemente.

```js
// Funciones flecha
const doble = (x) => x * 2

// Desestructuración
const { nombre, provincia } = orquesta
const [primero, segundo] = lista

// Spread: copiar y extender
const nuevaLista = [...lista, elemento]
const nuevoObjeto = { ...objeto, campo: 'nuevo' }

// Métodos de array (sin modificar el original)
lista.map((x) => ...)       // transformar cada elemento
lista.filter((x) => ...)    // quedarse con algunos
lista.find((x) => ...)      // el primero que cumpla

// Encadenamiento opcional: no falla si usuario es null
usuario?.rol

// Plantillas de texto
`/orquestas/${id}`

// async / await
async function cargar() {
  try {
    const datos = await api('/orquestas')
  } catch (err) { ... }
}

// Módulos
import algo from './fichero.js'
export default function Componente() {}
```

---

## 16. Reglas de los hooks

Las funciones que empiezan por `use` (`useState`, `useEffect`, `useParams`, `useAuth`...) se
llaman *hooks* y tienen dos reglas:

1. Solo se llaman **dentro de componentes** (o de otros hooks).
2. Se llaman **siempre en el nivel superior** del componente: nunca dentro de un `if`, un bucle
   o después de un `return`.

```jsx
// ❌ mal
if (usuario) {
  const [x, setX] = useState(0)
}

// ✅ bien
const [x, setX] = useState(0)
if (!usuario) return null
```

---

## 17. Herramientas y depuración

- **Consola del navegador (F12):** React avisa ahí de errores comunes (keys que faltan, hooks mal usados...).
- **React Developer Tools** (extensión de Chrome/Firefox): muestra el árbol de componentes con sus
  props y su estado en tiempo real. Muy recomendable.
- **Pestaña Red (Network):** para ver las peticiones a `/api` y qué responde el backend.
- `console.log` sigue funcionando igual que siempre.
- En desarrollo, `<StrictMode>` (en `main.jsx`) ejecuta los efectos **dos veces** a propósito
  para detectar errores. Si ves un `fetch` duplicado en la pestaña Red, es por eso; no pasa en
  producción.

---

## 18. Por dónde empezar

Antes de ponerte con el Paso 9 de la guía del proyecto, un calentamiento corto:

1. Abre `src/pages/Inicio.jsx` y léelo entero: usa `useState`, `useEffect` y la función `api`.
2. Crea `src/components/TarjetaOrquesta.jsx` que reciba `nombre` y `provincia` por props y
   úsala dos veces en `Inicio.jsx` con datos inventados.
3. Crea un array de orquestas inventadas en `Inicio.jsx` y píntalo con `map` (no olvides `key`).
4. Añade un `<input>` controlado que filtre esa lista por provincia mientras escribes
   (estado + `filter`).
5. Crea una segunda página, añade su `<Route>` en `App.jsx` y un `<Link>` para llegar a ella.

Con eso habrás tocado todos los conceptos de esta guía salvo Context, que llega en el Paso 9
con la autenticación.

Tutorial oficial recomendado para practicar: https://es.react.dev/learn/tutorial-tic-tac-toe
