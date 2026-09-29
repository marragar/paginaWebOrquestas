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


# TODO: añadir creado_en: datetime a UsuarioOut (la pantalla de admin muestra la fecha de alta)

# TODO: UsuarioRegistroIn (email, password, nombre, tipo y campos opcionales; ¡nunca es_admin!)
#       password: str = Field(min_length=8)  — el frontend avisa de «Mínimo 8 caracteres»
# TODO: UsuarioUpdateIn para PUT /mi-perfil — sin email (no se puede cambiar) ni es_admin

# TODO: UsuarioResumenOut — lo que ve la orquesta de quien le pide una fecha (SPEC §5.2):
#       id, nombre, tipo, municipio, provincia, telefono. Sin email ni cif.

# El resto de schemas está en auth.py, orquesta.py, disponibilidad.py y reserva.py.
