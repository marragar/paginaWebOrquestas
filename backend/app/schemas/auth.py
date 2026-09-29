# Schemas de autenticación (SPEC §5 Auth). Compartidos por los dos logins.

# TODO: LoginIn — email: EmailStr, password: str

# TODO: TokenOut — access_token: str, token_type: str = "bearer"

# TODO: MeOut para GET /auth/me (SPEC §5.2):
#       rol: Literal["usuario", "orquesta", "admin"]
#       cuenta: UsuarioOut | OrquestaPrivadaOut
#       El frontend usa "rol" para decidir el menú; "admin" es un usuario con es_admin=True.
