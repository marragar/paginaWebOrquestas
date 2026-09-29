"""Dependencias reutilizables para los routers (cuenta actual, permisos...)."""

# Los errores se lanzan con app.core.errores.error_negocio (SPEC §5.1):
#   sin token o token inválido/caducado -> 401 "no_autenticado"
#   token de otro tipo de cuenta o no admin -> 403 "sin_permiso"

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from app.core.security import decode_access_token, TipoCuenta
from app.core.errores import error_negocio

from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario, Orquesta

bearer = HTTPBearer(auto_error=False)  # para leer el header Authorization: Bearer <token>


# TODO: get_current_usuario -> lee el header Authorization: Bearer <token>,
#       lo decodifica con decode_access_token, comprueba que tipo == TipoCuenta.USUARIO
#       y carga el Usuario de la BD (401 si no existe, 403 si el token es de orquesta).

def get_current_usuario(credenciales: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> Usuario:
    if credenciales is None:
        raise error_negocio(401, "no_autenticado", "Token no proporcionado")
    
    
    decoded = decode_access_token(credenciales.credentials)
    
    userType = decoded.get("tipo")
    if(userType != TipoCuenta.USUARIO.value):
        raise error_negocio(403, "sin_permiso", "Token de tipo incorrecto")

    user_id = int(decoded.get("sub"))
    
    user = db.scalars(select(Usuario).where(Usuario.id == user_id)).first()
    
    if user is None:
        raise error_negocio(401, "no_autenticado", "Usuario no encontrado")
    
    return user
    

# TODO: get_current_orquesta -> igual, pero para TipoCuenta.ORQUESTA y el modelo Orquesta.

def get_current_orquesta(credenciales: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> Orquesta:
    if credenciales is None:
        raise error_negocio(401, "no_autenticado", "Token no proporcionado")
    
    decoded = decode_access_token(credenciales.credentials)


    
    userType = decoded.get("tipo")
    if(userType != TipoCuenta.ORQUESTA.value):
        raise error_negocio(403, "sin_permiso", "Token de tipo incorrecto")
    
    orquesta_id = int(decoded.get("sub"))
    
    orquesta = db.scalars(select(Orquesta).where(Orquesta.id == orquesta_id)).first()
    
    if orquesta is None:
        raise error_negocio(401, "no_autenticado", "Orquesta no encontrada")
    
    return orquesta

# TODO: get_current_admin -> usa get_current_usuario y lanza 403 si es_admin es False.
#       Ejemplo de uso:
#       @router.get("/...")
#       def endpoint(admin: Usuario = Depends(get_current_admin)): ...
def get_current_admin(credenciales: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> Usuario:
    
    if credenciales is None:
        raise error_negocio(401, "no_autenticado", "Token no proporcionado")
    
    decoded = decode_access_token(credenciales.credentials)
    
    user = get_current_usuario(credenciales, db)
    
    if not user.es_admin:
        raise error_negocio(403, "sin_permiso", "Usuario no es admin")
    
    return user

# TODO: get_current_cuenta -> para GET /auth/me: acepta cualquiera de los dos tipos de token y
#       devuelve (rol, cuenta), con rol "usuario", "orquesta" o "admin" (usuario con es_admin).
#       El frontend usa ese rol para decidir qué menú enseña (SPEC §5 Auth).
def get_current_cuenta(credenciales: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> tuple[str, Usuario | Orquesta]:
    
    if credenciales is None:
        raise error_negocio(401, "no_autenticado", "Token no proporcionado")
    
    decoded = decode_access_token(credenciales.credentials)
    
    
    userType = decoded.get("tipo")
    
    if userType == TipoCuenta.USUARIO.value:
        user = db.scalars(select(Usuario).where(Usuario.id == int(decoded.get("sub")))).first()
        if user is None:
            raise error_negocio(401, "no_autenticado", "Usuario no encontrado")
        rol = "admin" if user.es_admin else "usuario"
        cuenta = user
    elif userType == TipoCuenta.ORQUESTA.value:
        orquesta = db.scalars(select(Orquesta).where(Orquesta.id == int(decoded.get("sub")))).first()
        if orquesta is None:
            raise error_negocio(401, "no_autenticado", "Orquesta no encontrada")
        rol = "orquesta"
        cuenta = orquesta
    else:
        raise error_negocio(401, "no_autenticado", "Token de tipo incorrecto")
    
    return rol, cuenta
