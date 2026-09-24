"""Crea una cuenta ADMIN (SPEC §2: los admin no se registran desde la web).

Uso: docker compose exec backend python -m scripts.crear_admin <email> <password>
"""
import sys


def main(email: str, password: str) -> None:
    # TODO: abrir SessionLocal, comprobar que el email no existe,
    #       crear Usuario(rol=Rol.ADMIN, password_hash=hash_password(password)) y commit
    raise NotImplementedError


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
