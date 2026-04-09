from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/secrets", tags=["secrets (Barbican)"])

def conn(token): return get_connection(token)

# ─── Secrets ─────────────────────────────────────────────────────────────────

@router.get("")
async def list_secrets(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).key_manager.secrets()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/{secret_id}")
async def get_secret(secret_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).key_manager.get_secret(secret_id)
        if not s: raise HTTPException(404, "Secret not found")
        return serialize(s)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("", status_code=201)
async def create_secret(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).key_manager.create_secret(
            name=body.get("name"),
            payload=body.get("payload"),
            payload_content_type=body.get("payload_content_type", "text/plain"),
            secret_type=body.get("secret_type", "opaque"),
            algorithm=body.get("algorithm"),
            bit_length=body.get("bit_length"),
            mode=body.get("mode"),
            expiration=body.get("expiration"),
        )
        return serialize(s)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/{secret_id}", status_code=204)
async def delete_secret(secret_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).key_manager.delete_secret(secret_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Containers (Barbican containers, not Swift) ─────────────────────────────

@router.get("/containers")
async def list_containers(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(c) for c in conn(x_os_token).key_manager.containers()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/containers", status_code=201)
async def create_container(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).key_manager.create_container(
            name=body.get("name"),
            type=body.get("type", "generic"),
            secret_refs=body.get("secret_refs", []),
        )
        return serialize(c)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/containers/{container_id}", status_code=204)
async def delete_container(container_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).key_manager.delete_container(container_id)
    except Exception as e:
        raise HTTPException(502, str(e))
