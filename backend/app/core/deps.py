"""Dependencias reutilizables para los routers (cuenta actual, permisos...)."""

# TODO: get_current_usuario -> lee el header Authorization: Bearer <token>,
#       lo decodifica con decode_access_token, comprueba que tipo == TipoCuenta.USUARIO
#       y carga el Usuario de la BD (401 si no existe, 403 si el token es de orquesta).

# TODO: get_current_orquesta -> igual, pero para TipoCuenta.ORQUESTA y el modelo Orquesta.

# TODO: get_current_admin -> usa get_current_usuario y lanza 403 si es_admin es False.
#       Ejemplo de uso:
#       @router.get("/...")
#       def endpoint(admin: Usuario = Depends(get_current_admin)): ...
