import enum
from datetime import datetime, timezone, timedelta

import bcrypt
from app.config import settings
import jwt

from app.core.errores import error_negocio



class TipoCuenta(str, enum.Enum):
    """Qué tipo de cuenta hay detrás de un token (SPEC §2: logins separados)."""

    USUARIO = "usuario"
    ORQUESTA = "orquesta"


# bcrypt solo usa los primeros 72 bytes y, desde bcrypt 5, lanza ValueError si se pasan más.
# Los schemas de registro lo limitan con el tipo Password (app/schemas/auth.py).
MAX_BYTES_PASSWORD = 72


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    # Una contraseña más larga no pudo registrarse, así que nunca coincide (y evita el ValueError)
    if len(password.encode()) > MAX_BYTES_PASSWORD:
        return False
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(cuenta_id: int, tipo: TipoCuenta) -> str:
    # TODO: generar un JWT con pyjwt (sub=cuenta_id, tipo, exp) usando settings.jwt_secret.
    #       El "tipo" es imprescindible: el usuario 5 y la orquesta 5 son cuentas distintas.
    
    hora = datetime.now(timezone.utc)
    
    payload = {
        "sub": str(cuenta_id),
        "tipo": tipo.value,
        "iat": hora,
        "exp": hora + timedelta(minutes=settings.jwt_expire_minutes)    
    }
    
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    # TODO: decodificar y validar el JWT; lanzar error si ha caducado o es inválido
    try:
        decoded = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return decoded
    except jwt.ExpiredSignatureError:
        raise error_negocio(401, "no_autenticado", "Token caducado")
    except jwt.InvalidTokenError:
        raise error_negocio(401, "no_autenticado", "Token inválido")
