from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/dns", tags=["dns (Designate)"])

def conn(token): return get_connection(token)

# ─── Zones ───────────────────────────────────────────────────────────────────

@router.get("/zones")
async def list_zones(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(z) for z in conn(x_os_token).dns.zones()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/zones/{zone_id}")
async def get_zone(zone_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        z = conn(x_os_token).dns.get_zone(zone_id)
        if not z: raise HTTPException(404, "Zone not found")
        return serialize(z)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/zones", status_code=201)
async def create_zone(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        z = conn(x_os_token).dns.create_zone(
            name=body["name"],
            type=body.get("type", "PRIMARY"),
            email=body.get("email", "admin@example.com"),
            ttl=body.get("ttl", 3600),
            description=body.get("description", ""),
        )
        return serialize(z)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/zones/{zone_id}", status_code=204)
async def delete_zone(zone_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).dns.delete_zone(zone_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Recordsets ──────────────────────────────────────────────────────────────

@router.get("/zones/{zone_id}/recordsets")
async def list_recordsets(zone_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(r) for r in conn(x_os_token).dns.recordsets(zone_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/zones/{zone_id}/recordsets", status_code=201)
async def create_recordset(zone_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        r = conn(x_os_token).dns.create_recordset(
            zone_id,
            name=body["name"],
            type=body.get("type", "A"),
            records=body["records"],
            ttl=body.get("ttl", 3600),
            description=body.get("description", ""),
        )
        return serialize(r)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.put("/zones/{zone_id}/recordsets/{recordset_id}")
async def update_recordset(zone_id: str, recordset_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        r = conn(x_os_token).dns.update_recordset(
            recordset_id, zone_id,
            records=body.get("records"),
            ttl=body.get("ttl"),
            description=body.get("description"),
        )
        return serialize(r)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/zones/{zone_id}/recordsets/{recordset_id}", status_code=204)
async def delete_recordset(zone_id: str, recordset_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).dns.delete_recordset(recordset_id, zone_id)
    except Exception as e:
        raise HTTPException(502, str(e))
