from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.usuario import Rol


class UsuarioOut(BaseModel):
    """Ejemplo de schema de salida (lo que devuelve la API, nunca el password_hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    rol: Rol
    activo: bool


# TODO: RegistroIn (email, password, rol + datos del perfil según el rol)
# TODO: LoginIn, TokenOut
