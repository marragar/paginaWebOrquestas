"""Crea un usuario administrador (SPEC §2: los admin no se registran desde la web).

Uso: docker compose exec backend python -m scripts.crear_admin <email> <password> <nombre>
"""
import sys


def main(email: str, password: str, nombre: str) -> None:
    # TODO: abrir SessionLocal, comprobar que el email no existe (ni en usuarios ni en orquestas),
    #       crear Usuario(es_admin=True, tipo=..., password_hash=hash_password(password)) y commit.
    #       Alternativa: si el email ya es de un usuario, simplemente marcarlo como es_admin=True.
    raise NotImplementedError


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
