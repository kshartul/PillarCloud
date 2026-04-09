from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = 8002
    os_auth_url: str     = "http://keystone:5000/v3"
    os_username: str     = "admin"
    os_password: str     = "admin_password"
    os_project_name: str = "admin"
    os_domain_name: str  = "Default"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
