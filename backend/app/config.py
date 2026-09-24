from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://orquestas:orquestas@localhost:5432/orquestas"
    jwt_secret: str = "cambia-esto"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60


settings = Settings()
