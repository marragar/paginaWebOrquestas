"""Dependencias reutilizables para los routers (usuario actual, control de roles...)."""

# TODO: get_current_user -> lee el header Authorization: Bearer <token>,
#       lo decodifica con decode_access_token y carga el Usuario de la BD.
#       Debe rechazar cuentas con activo=False.

# TODO: require_rol(*roles) -> dependencia que lanza 403 si el usuario
#       no tiene uno de los roles indicados. Ejemplo de uso:
#       @router.get("/...", dependencies=[Depends(require_rol(Rol.ADMIN))])
