from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = 8001
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "openstack_portal"
    postgres_user: str = "portal_user"
    postgres_password: str = "portal_pass"
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672"
    jwt_secret: str = "changeme"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
