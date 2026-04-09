import openstack
from config import settings
from functools import lru_cache

def get_connection(os_token: str = None) -> openstack.connection.Connection:
    """Return an OpenStack connection. Uses token if provided, else admin creds."""
    if os_token:
        return openstack.connect(
            auth_url=settings.os_auth_url,
            token=os_token,
            auth_type="token",
        )
    return openstack.connect(
        auth_url=settings.os_auth_url,
        username=settings.os_username,
        password=settings.os_password,
        project_name=settings.os_project_name,
        user_domain_name=settings.os_domain_name,
        project_domain_name=settings.os_domain_name,
    )

def serialize(obj) -> dict:
    """Safely convert an openstack resource to a plain dict."""
    if obj is None:
        return {}
    try:
        return dict(obj)
    except Exception:
        return {k: v for k, v in vars(obj).items() if not k.startswith("_")}
