// Envoltorio mínimo de fetch para hablar con el backend.
// TODO: guardar/leer el token JWT y añadir la cabecera Authorization automáticamente.

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.status === 204 ? null : res.json()
}
