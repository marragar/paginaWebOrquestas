"""Errores de negocio con código estable (SPEC §5.1).

La API no devuelve frases para el usuario: el frontend traduce el `codigo` al idioma elegido
(español, inglés o gallego). `mensaje` es solo para quien depura.

Uso en un router:
    from app.core.errores import error_negocio

    if fecha < date.today():
        raise error_negocio(422, "fecha_pasada", "Solo se pueden publicar fechas futuras")
"""
from fastapi import HTTPException

# Códigos previstos en SPEC §5.1. Si añades uno, añádelo también allí y en los textos del
# frontend (frontend/src/i18n/*.js).
CODIGOS = {
    "credenciales_incorrectas",
    "no_autenticado",
    "sin_permiso",
    "email_repetido",
    "no_encontrado",
    "fecha_pasada",
    "fecha_duplicada",
    "fecha_no_libre",
    "solicitud_duplicada",
    "fecha_con_reserva",
    "ya_aceptada",
    "estado_no_valido"
}


def error_negocio(status_code: int, codigo: str, mensaje: str, **extra) -> HTTPException:
    """Crea la excepción con el formato {"detail": {"codigo", "mensaje", ...extra}}.

    `extra` sirve para dar contexto, p. ej. la fecha que ha fallado en una operación múltiple:
        raise error_negocio(409, "fecha_duplicada", "...", fecha="2026-10-10")
    """
    assert codigo in CODIGOS, f"Código de error no documentado: {codigo}"
    return HTTPException(status_code=status_code, detail={"codigo": codigo, "mensaje": mensaje, **extra})
