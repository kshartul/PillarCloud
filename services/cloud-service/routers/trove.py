from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/databases", tags=["databases (Trove)"])

def conn(token): return get_connection(token)

# ─── Instances ───────────────────────────────────────────────────────────────

@router.get("/instances")
async def list_instances(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(i) for i in conn(x_os_token).database.instances()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/instances/{instance_id}")
async def get_instance(instance_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        i = conn(x_os_token).database.get_instance(instance_id)
        if not i: raise HTTPException(404, "Database instance not found")
        return serialize(i)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/instances", status_code=201)
async def create_instance(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        i = conn(x_os_token).database.create_instance(
            name=body["name"],
            flavor_id=body["flavor_id"],
            volume_size=body.get("volume_size", 5),
            datastore_type=body.get("datastore_type", "mysql"),
            datastore_version=body.get("datastore_version"),
            databases=body.get("databases", []),
            users=body.get("users", []),
            networks=body.get("networks", []),
        )
        return serialize(i)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/instances/{instance_id}", status_code=204)
async def delete_instance(instance_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).database.delete_instance(instance_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/instances/{instance_id}/action")
async def instance_action(instance_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    action = body.get("action")
    c = conn(x_os_token)
    try:
        if action == "restart":
            c.database.restart_instance(instance_id)
        elif action == "resize_volume":
            c.database.resize_instance_volume(instance_id, body["size"])
        elif action == "resize_flavor":
            c.database.resize_instance(instance_id, body["flavor_id"])
        else:
            raise HTTPException(400, f"Unknown action: {action}")
        return {"message": f"Action '{action}' initiated"}
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Datastores ──────────────────────────────────────────────────────────────

@router.get("/datastores")
async def list_datastores(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(d) for d in conn(x_os_token).database.datastores()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/datastores/{datastore_id}/versions")
async def list_datastore_versions(datastore_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(v) for v in conn(x_os_token).database.datastore_versions(datastore_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Flavors ─────────────────────────────────────────────────────────────────

@router.get("/flavors")
async def list_flavors(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(f) for f in conn(x_os_token).database.flavors()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Backups ─────────────────────────────────────────────────────────────────

@router.get("/backups")
async def list_backups(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(b) for b in conn(x_os_token).database.backups()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/backups", status_code=201)
async def create_backup(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        b = conn(x_os_token).database.create_backup(
            instance_id=body["instance_id"],
            name=body.get("name"),
            description=body.get("description", ""),
        )
        return serialize(b)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/backups/{backup_id}", status_code=204)
async def delete_backup(backup_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).database.delete_backup(backup_id)
    except Exception as e:
        raise HTTPException(502, str(e))
