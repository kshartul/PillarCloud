from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/shared-file-systems", tags=["shared-file-systems (Manila)"])

def conn(token): return get_connection(token)

# ─── Shares ──────────────────────────────────────────────────────────────────

@router.get("/shares")
async def list_shares(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).shared_file_system.shares()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/shares/{share_id}")
async def get_share(share_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).shared_file_system.get_share(share_id)
        if not s: raise HTTPException(404, "Share not found")
        return serialize(s)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/shares", status_code=201)
async def create_share(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).shared_file_system.create_share(
            name=body.get("name"),
            share_proto=body.get("share_proto", "NFS"),
            size=body["size"],
            share_type=body.get("share_type"),
            share_network_id=body.get("share_network_id"),
            description=body.get("description", ""),
        )
        return serialize(s)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/shares/{share_id}", status_code=204)
async def delete_share(share_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).shared_file_system.delete_share(share_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Share Access Rules ──────────────────────────────────────────────────────

@router.get("/shares/{share_id}/access")
async def list_access_rules(share_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(a) for a in conn(x_os_token).shared_file_system.access_rules(share_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/shares/{share_id}/access", status_code=201)
async def create_access_rule(share_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        a = conn(x_os_token).shared_file_system.create_access_rule(
            share_id,
            access_level=body.get("access_level", "rw"),
            access_type=body.get("access_type", "ip"),
            access_to=body["access_to"],
        )
        return serialize(a)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/shares/{share_id}/access/{rule_id}", status_code=204)
async def delete_access_rule(share_id: str, rule_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).shared_file_system.delete_access_rule(rule_id, share_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Share Networks ──────────────────────────────────────────────────────────

@router.get("/share-networks")
async def list_share_networks(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(sn) for sn in conn(x_os_token).shared_file_system.share_networks()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Share Types ─────────────────────────────────────────────────────────────

@router.get("/share-types")
async def list_share_types(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(st) for st in conn(x_os_token).shared_file_system.share_types()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Snapshots ───────────────────────────────────────────────────────────────

@router.get("/snapshots")
async def list_snapshots(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).shared_file_system.share_snapshots()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/snapshots", status_code=201)
async def create_snapshot(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).shared_file_system.create_share_snapshot(
            share_id=body["share_id"],
            name=body.get("name"),
            description=body.get("description", ""),
        )
        return serialize(s)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/snapshots/{snapshot_id}", status_code=204)
async def delete_snapshot(snapshot_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).shared_file_system.delete_share_snapshot(snapshot_id)
    except Exception as e:
        raise HTTPException(502, str(e))
