from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/storage", tags=["storage"])

def conn(token): return get_connection(token)

@router.get("/volumes")
async def list_volumes(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(v) for v in conn(x_os_token).block_storage.volumes(details=True)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/volumes", status_code=201)
async def create_volume(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        vol = c.block_storage.create_volume(
            name=body["name"],
            size=body["size"],
            volume_type=body.get("type"),
            description=body.get("description"),
            snapshot_id=body.get("snapshot_id"),
        )
        return serialize(vol)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/volumes/{volume_id}")
async def get_volume(volume_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        v = conn(x_os_token).block_storage.get_volume(volume_id)
        if not v: raise HTTPException(404, "Volume not found")
        return serialize(v)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/volumes/{volume_id}", status_code=204)
async def delete_volume(volume_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).block_storage.delete_volume(volume_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/volumes/{volume_id}/attach")
async def attach_volume(volume_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        c.compute.create_volume_attachment(body["server_id"], volumeId=volume_id, device=body.get("device"))
        return {"message": "Volume attached"}
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/volumes/{volume_id}/detach")
async def detach_volume(volume_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        c.compute.delete_volume_attachment(body["attachment_id"], body["server_id"])
        return {"message": "Volume detached"}
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/snapshots")
async def list_snapshots(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).block_storage.snapshots(details=True)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/snapshots", status_code=201)
async def create_snapshot(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        snap = conn(x_os_token).block_storage.create_snapshot(
            volume_id=body["volume_id"],
            name=body["name"],
            description=body.get("description"),
            is_forced=body.get("force", False),
        )
        return serialize(snap)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/snapshots/{snapshot_id}", status_code=204)
async def delete_snapshot(snapshot_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).block_storage.delete_snapshot(snapshot_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/volume-types")
async def list_volume_types(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(t) for t in conn(x_os_token).block_storage.types()]
    except Exception as e:
        raise HTTPException(502, str(e))
