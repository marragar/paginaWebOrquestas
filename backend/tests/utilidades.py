"""Funciones de ayuda para los tests (las de conftest.py no se pueden importar)."""


def assert_error(respuesta, status, codigo):
    """Comprueba el código HTTP y el `codigo` de error de SPEC §5.1 (no el texto)."""
    assert respuesta.status_code == status, respuesta.text
    assert respuesta.json()["detail"]["codigo"] == codigo
