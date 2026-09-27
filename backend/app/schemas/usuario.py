from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.usuario import TipoUsuario


class UsuarioOut(BaseModel):
    """Ejemplo de schema de salida (lo que devuelve la API, nunca el password_hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nombre: str
    tipo: TipoUsuario
    cif: str | None
    municipio: str | None
    provincia: str | None
    telefono: str | None
    es_admin: bool


# TODO: UsuarioRegistroIn (email, password, nombre, tipo y campos opcionales; ¡nunca es_admin!)
# TODO: UsuarioUpdateIn para PUT /mi-perfil
# TODO: LoginIn, TokenOut (compartidos por los dos logins -> quizá en schemas/auth.py)
# TODO: schemas/orquesta.py, schemas/disponibilidad.py, schemas/reserva.py
