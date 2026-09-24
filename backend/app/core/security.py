import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(usuario_id: int, rol: str) -> str:
    # TODO: generar un JWT con pyjwt (sub, rol, exp) usando settings.jwt_secret
    raise NotImplementedError


def decode_access_token(token: str) -> dict:
    # TODO: decodificar y validar el JWT; lanzar error si ha caducado o es inválido
    raise NotImplementedError
