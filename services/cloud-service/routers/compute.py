from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/compute", tags=["compute"])

def conn(token):
    return get_connection(token)

# ── Instances ──────────────────────────────────────────────────────────────────

@router.get("/instances")
async def list_instances(x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        return [serialize(s) for s in c.compute.servers(details=True)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/instances", status_code=201)
async def create_instance(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        server = c.compute.create_server(
            name=body["name"],
            flavor_id=body["flavor_id"],
            image_id=body["image_id"],
            networks=[{"uuid": nid} for nid in body.get("network_ids", [])],
            key_name=body.get("key_name"),
            security_groups=[{"name": sg} for sg in body.get("security_groups", ["default"])],
            user_data=body.get("user_data"),
        )
        server = c.compute.wait_for_server(server)
        return serialize(server)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/instances/{server_id}")
async def get_instance(server_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        server = c.compute.get_server(server_id)
        if not server:
            raise HTTPException(404, "Instance not found")
        return serialize(server)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/instances/{server_id}", status_code=204)
async def delete_instance(server_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        c.compute.delete_server(server_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/instances/{server_id}/action")
async def instance_action(server_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    action = body.get("action")
    try:
        c = conn(x_os_token)
        server = c.compute.get_server(server_id)
        if action == "start":
            c.compute.start_server(server)
        elif action == "stop":
            c.compute.stop_server(server)
        elif action == "reboot":
            reboot_type = body.get("type", "SOFT")
            c.compute.reboot_server(server, reboot_type)
        elif action == "resize":
            c.compute.resize_server(server, body["flavor_id"])
        else:
            raise HTTPException(400, f"Unknown action: {action}")
        return {"message": f"Action '{action}' triggered"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, str(e))

# ── Flavors ────────────────────────────────────────────────────────────────────

@router.get("/flavors")
async def list_flavors(x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        return [serialize(f) for f in c.compute.flavors()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ── Keypairs ───────────────────────────────────────────────────────────────────

@router.get("/keypairs")
async def list_keypairs(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(k) for k in conn(x_os_token).compute.keypairs()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/keypairs", status_code=201)
async def create_keypair(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        kp = conn(x_os_token).compute.create_keypair(name=body["name"], public_key=body.get("public_key"))
        return serialize(kp)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/keypairs/{name}", status_code=204)
async def delete_keypair(name: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).compute.delete_keypair(name)
    except Exception as e:
        raise HTTPException(502, str(e))

# ── Security Groups ────────────────────────────────────────────────────────────

@router.get("/security-groups")
async def list_security_groups(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(sg) for sg in conn(x_os_token).network.security_groups()]
    except Exception as e:
        raise HTTPException(502, str(e))
