from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/load-balancers", tags=["load-balancers (Octavia)"])

def conn(token): return get_connection(token)

# ─── Load Balancers ──────────────────────────────────────────────────────────

@router.get("")
async def list_load_balancers(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(lb) for lb in conn(x_os_token).load_balancer.load_balancers()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/{lb_id}")
async def get_load_balancer(lb_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        lb = conn(x_os_token).load_balancer.get_load_balancer(lb_id)
        if not lb: raise HTTPException(404, "Load balancer not found")
        return serialize(lb)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("", status_code=201)
async def create_load_balancer(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        lb = conn(x_os_token).load_balancer.create_load_balancer(
            name=body.get("name"),
            vip_subnet_id=body["vip_subnet_id"],
            description=body.get("description", ""),
        )
        return serialize(lb)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/{lb_id}", status_code=204)
async def delete_load_balancer(lb_id: str, cascade: bool = False, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).load_balancer.delete_load_balancer(lb_id, cascade=cascade)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Listeners ───────────────────────────────────────────────────────────────

@router.get("/{lb_id}/listeners")
async def list_listeners(lb_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(l) for l in conn(x_os_token).load_balancer.listeners(loadbalancer_id=lb_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/{lb_id}/listeners", status_code=201)
async def create_listener(lb_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        l = conn(x_os_token).load_balancer.create_listener(
            name=body.get("name"),
            loadbalancer_id=lb_id,
            protocol=body.get("protocol", "HTTP"),
            protocol_port=body.get("protocol_port", 80),
        )
        return serialize(l)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/listeners/{listener_id}", status_code=204)
async def delete_listener(listener_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).load_balancer.delete_listener(listener_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Pools ───────────────────────────────────────────────────────────────────

@router.get("/pools")
async def list_pools(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(p) for p in conn(x_os_token).load_balancer.pools()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/pools", status_code=201)
async def create_pool(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        p = conn(x_os_token).load_balancer.create_pool(
            name=body.get("name"),
            listener_id=body.get("listener_id"),
            protocol=body.get("protocol", "HTTP"),
            lb_algorithm=body.get("lb_algorithm", "ROUND_ROBIN"),
        )
        return serialize(p)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/pools/{pool_id}", status_code=204)
async def delete_pool(pool_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).load_balancer.delete_pool(pool_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Pool Members ────────────────────────────────────────────────────────────

@router.get("/pools/{pool_id}/members")
async def list_members(pool_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(m) for m in conn(x_os_token).load_balancer.members(pool_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/pools/{pool_id}/members", status_code=201)
async def create_member(pool_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        m = conn(x_os_token).load_balancer.create_member(
            pool_id,
            address=body["address"],
            protocol_port=body.get("protocol_port", 80),
            subnet_id=body.get("subnet_id"),
            name=body.get("name"),
        )
        return serialize(m)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/pools/{pool_id}/members/{member_id}", status_code=204)
async def delete_member(pool_id: str, member_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).load_balancer.delete_member(member_id, pool_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Health Monitors ─────────────────────────────────────────────────────────

@router.get("/health-monitors")
async def list_health_monitors(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(h) for h in conn(x_os_token).load_balancer.health_monitors()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/health-monitors", status_code=201)
async def create_health_monitor(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        h = conn(x_os_token).load_balancer.create_health_monitor(
            pool_id=body["pool_id"],
            type=body.get("type", "HTTP"),
            delay=body.get("delay", 5),
            timeout=body.get("timeout", 5),
            max_retries=body.get("max_retries", 3),
            url_path=body.get("url_path", "/"),
        )
        return serialize(h)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))
