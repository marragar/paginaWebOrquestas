import enum

import bcrypt


class TipoCuenta(str, enum.Enum):
    """Qué tipo de cuenta hay detrás de un token (SPEC §2: logins separados)."""

    USUARIO = "usuario"
    ORQUESTA = "orquesta"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(cuenta_id: int, tipo: TipoCuenta) -> str:
    # TODO: generar un JWT con pyjwt (sub=cuenta_id, tipo, exp) usando settings.jwt_secret.
    #       El "tipo" es imprescindible: el usuario 5 y la orquesta 5 son cuentas distintas.
    raise NotImplementedError


def decode_access_token(token: str) -> dict:
    # TODO: decodificar y validar el JWT; lanzar error si ha caducado o es inválido
    raise NotImplementedError
