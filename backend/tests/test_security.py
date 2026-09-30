"""Tests del Paso 2: contraseñas, tokens JWT y dependencias de autenticación.

Las dependencias se prueban primero en los casos que fallan antes de consultar la BD (db=None)
y al final con cuentas reales en la BD de tests (Paso 3).
"""
import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import TypeAdapter, ValidationError

from app.config import settings
from app.core.deps import (
    get_current_admin,
    get_current_cuenta,
    get_current_orquesta,
    get_current_usuario,
)
from app.core.security import (
    TipoCuenta,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.schemas.auth import Password


def assert_error(excinfo, status, codigo):
    assert excinfo.value.status_code == status
    assert excinfo.value.detail["codigo"] == codigo


def credenciales(token):
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


# --- Contraseñas ---

def test_hash_no_guarda_la_contrasena_en_claro():
    assert hash_password("secreto123") != "secreto123"


def test_verify_password_con_mas_de_72_bytes_da_false_sin_error():
    # bcrypt 5 lanzaría ValueError; en el login eso sería un 500
    password_hash = hash_password("secreto123")
    assert not verify_password("a" * 100, password_hash)


@pytest.mark.parametrize("password, valida", [
    ("1234567", False),         # menos de 8 caracteres
    ("12345678", True),
    ("a" * 72, True),           # justo el límite de bcrypt
    ("a" * 73, False),
    ("ñ" * 36, True),           # 36 caracteres, 72 bytes
    ("ñ" * 37, False),          # 37 caracteres, pero 74 bytes
])
def test_tipo_password_de_los_registros(password, valida):
    adaptador = TypeAdapter(Password)
    if valida:
        assert adaptador.validate_python(password) == password
    else:
        with pytest.raises(ValidationError):
            adaptador.validate_python(password)


def test_verify_password_correcta_e_incorrecta():
    password_hash = hash_password("secreto123")
    assert verify_password("secreto123", password_hash)
    assert not verify_password("otra-cosa", password_hash)


# --- Tokens ---

@pytest.mark.parametrize("tipo", list(TipoCuenta))
def test_token_se_decodifica_con_el_mismo_id_y_tipo(tipo):
    datos = decode_access_token(create_access_token(5, tipo))
    assert int(datos["sub"]) == 5
    assert datos["tipo"] == tipo.value


def test_token_caducado_da_401(monkeypatch):
    monkeypatch.setattr(settings, "jwt_expire_minutes", -1)
    token = create_access_token(5, TipoCuenta.USUARIO)
    with pytest.raises(HTTPException) as excinfo:
        decode_access_token(token)
    assert_error(excinfo, 401, "no_autenticado")


def test_token_manipulado_da_401():
    token = create_access_token(5, TipoCuenta.USUARIO)
    with pytest.raises(HTTPException) as excinfo:
        decode_access_token(token[:-3] + "abc")
    assert_error(excinfo, 401, "no_autenticado")


def test_token_firmado_con_otro_secreto_da_401():
    token = jwt.encode(
        {"sub": "5", "tipo": "usuario"}, "otro-secreto-de-al-menos-32-bytes!!", algorithm="HS256"
    )
    with pytest.raises(HTTPException) as excinfo:
        decode_access_token(token)
    assert_error(excinfo, 401, "no_autenticado")


# --- Dependencias (casos que no llegan a la BD) ---

@pytest.mark.parametrize("dependencia", [get_current_usuario, get_current_orquesta, get_current_cuenta])
def test_sin_token_da_401(dependencia):
    with pytest.raises(HTTPException) as excinfo:
        dependencia(None, None)
    assert_error(excinfo, 401, "no_autenticado")


@pytest.mark.parametrize("dependencia", [get_current_usuario, get_current_orquesta, get_current_cuenta])
def test_token_manipulado_en_dependencia_da_401(dependencia):
    token = create_access_token(5, TipoCuenta.USUARIO)
    with pytest.raises(HTTPException) as excinfo:
        dependencia(credenciales(token[:-3] + "abc"), None)
    assert_error(excinfo, 401, "no_autenticado")


def test_token_de_orquesta_en_zona_de_usuario_da_403():
    token = create_access_token(5, TipoCuenta.ORQUESTA)
    with pytest.raises(HTTPException) as excinfo:
        get_current_usuario(credenciales(token), None)
    assert_error(excinfo, 403, "sin_permiso")


def test_token_de_usuario_en_zona_de_orquesta_da_403():
    token = create_access_token(5, TipoCuenta.USUARIO)
    with pytest.raises(HTTPException) as excinfo:
        get_current_orquesta(credenciales(token), None)
    assert_error(excinfo, 403, "sin_permiso")


def test_tipo_de_token_desconocido_da_401():
    token = jwt.encode({"sub": "5", "tipo": "otro"}, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    with pytest.raises(HTTPException) as excinfo:
        get_current_cuenta(credenciales(token), None)
    assert_error(excinfo, 401, "no_autenticado")


# --- Dependencias con cuentas reales (BD de tests) ---

def token_de(cuenta, tipo):
    return credenciales(create_access_token(cuenta.id, tipo))


def test_get_current_usuario_devuelve_el_usuario(db, crear_usuario):
    usuario = crear_usuario()
    assert get_current_usuario(token_de(usuario, TipoCuenta.USUARIO), db).id == usuario.id


def test_get_current_orquesta_devuelve_la_orquesta(db, crear_orquesta):
    orquesta = crear_orquesta()
    assert get_current_orquesta(token_de(orquesta, TipoCuenta.ORQUESTA), db).id == orquesta.id


@pytest.mark.parametrize("dependencia", [get_current_usuario, get_current_cuenta])
def test_usuario_borrado_da_401(db, crear_usuario, dependencia):
    usuario = crear_usuario()
    cred = token_de(usuario, TipoCuenta.USUARIO)
    db.delete(usuario)
    db.commit()
    with pytest.raises(HTTPException) as excinfo:
        dependencia(cred, db)
    assert_error(excinfo, 401, "no_autenticado")


@pytest.mark.parametrize("dependencia", [get_current_orquesta, get_current_cuenta])
def test_orquesta_borrada_da_401(db, crear_orquesta, dependencia):
    orquesta = crear_orquesta()
    cred = token_de(orquesta, TipoCuenta.ORQUESTA)
    db.delete(orquesta)
    db.commit()
    with pytest.raises(HTTPException) as excinfo:
        dependencia(cred, db)
    assert_error(excinfo, 401, "no_autenticado")


def test_admin_con_usuario_normal_da_403(db, crear_usuario):
    usuario = crear_usuario()
    with pytest.raises(HTTPException) as excinfo:
        get_current_admin(token_de(usuario, TipoCuenta.USUARIO), db)
    assert_error(excinfo, 403, "sin_permiso")


def test_admin_con_admin_deja_pasar(db, crear_usuario):
    admin = crear_usuario(es_admin=True)
    assert get_current_admin(token_de(admin, TipoCuenta.USUARIO), db).id == admin.id


def test_admin_con_token_de_orquesta_da_403(db, crear_orquesta):
    orquesta = crear_orquesta()
    with pytest.raises(HTTPException) as excinfo:
        get_current_admin(token_de(orquesta, TipoCuenta.ORQUESTA), db)
    assert_error(excinfo, 403, "sin_permiso")


def test_get_current_cuenta_devuelve_el_rol(db, crear_usuario, crear_orquesta):
    usuario = crear_usuario()
    admin = crear_usuario(es_admin=True)
    orquesta = crear_orquesta()
    assert get_current_cuenta(token_de(usuario, TipoCuenta.USUARIO), db) == ("usuario", usuario)
    assert get_current_cuenta(token_de(admin, TipoCuenta.USUARIO), db) == ("admin", admin)
    assert get_current_cuenta(token_de(orquesta, TipoCuenta.ORQUESTA), db) == ("orquesta", orquesta)


def test_usuario_y_orquesta_con_el_mismo_id_son_cuentas_distintas(db, crear_usuario, crear_orquesta):
    # SPEC §2: el id no basta, el token lleva también el tipo
    usuario = crear_usuario()
    orquesta = crear_orquesta(id=usuario.id)
    rol, cuenta = get_current_cuenta(token_de(orquesta, TipoCuenta.ORQUESTA), db)
    assert rol == "orquesta" and cuenta is orquesta
