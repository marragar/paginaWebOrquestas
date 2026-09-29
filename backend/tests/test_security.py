"""Tests del Paso 2: contraseñas, tokens JWT y dependencias de autenticación.

Las dependencias se prueban solo en los casos que fallan antes de consultar la BD (db=None);
los casos con cuentas reales llegarán con la BD de tests (Paso 3).
"""
import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.config import settings
from app.core.deps import get_current_cuenta, get_current_orquesta, get_current_usuario
from app.core.security import (
    TipoCuenta,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def assert_error(excinfo, status, codigo):
    assert excinfo.value.status_code == status
    assert excinfo.value.detail["codigo"] == codigo


def credenciales(token):
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


# --- Contraseñas ---

def test_hash_no_guarda_la_contrasena_en_claro():
    assert hash_password("secreto123") != "secreto123"


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
