# Schemas de autenticación (SPEC §5 Auth). Compartidos por los dos logins.
from typing import Annotated

from pydantic import AfterValidator, Field

from app.core.security import MAX_BYTES_PASSWORD


def _cabe_en_bcrypt(password: str) -> str:
    # Se cuentan bytes, no caracteres: "ñ" o un emoji ocupan más de uno
    if len(password.encode()) > MAX_BYTES_PASSWORD:
        raise ValueError(f"La contraseña no puede ocupar más de {MAX_BYTES_PASSWORD} bytes")
    return password


# Contraseña para los registros (SPEC §5.1): mínimo 8 caracteres y máximo 72 bytes.
# Uso:  password: Password   (en UsuarioRegistroIn y OrquestaRegistroIn)
Password = Annotated[str, Field(min_length=8), AfterValidator(_cabe_en_bcrypt)]

# TODO: LoginIn — email: EmailStr, password: str
#       (aquí basta str: verify_password ya rechaza las de más de 72 bytes)

# TODO: TokenOut — access_token: str, token_type: str = "bearer"

# TODO: MeOut para GET /auth/me (SPEC §5.2):
#       rol: Literal["usuario", "orquesta", "admin"]
#       cuenta: UsuarioOut | OrquestaPrivadaOut
#       El frontend usa "rol" para decidir el menú; "admin" es un usuario con es_admin=True.
