// Envoltorio mínimo de fetch para hablar con el backend.
// TODO: guardar/leer el token JWT y añadir la cabecera Authorization automáticamente.
// TODO: si la respuesta es 401, cerrar sesión (borrar token) y mandar a /entrar.
// TODO: los errores de negocio llegan como { detail: { codigo, mensaje } } (SPEC §5.1).
//       Lanza un error que lleve ese `codigo` (p. ej. class ErrorApi extends Error { codigo }),
//       para que la pantalla muestre t(`errores.${codigo}`) en el idioma elegido.
//       Si no hay código (error de red, 500...), usa 'desconocido'.

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
