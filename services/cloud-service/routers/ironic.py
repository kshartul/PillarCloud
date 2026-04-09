from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/baremetal", tags=["baremetal (Ironic)"])

def conn(token): return get_connection(token)

# ─── Nodes ───────────────────────────────────────────────────────────────────

@router.get("/nodes")
async def list_nodes(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(n) for n in conn(x_os_token).baremetal.nodes()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/nodes/{node_id}")
async def get_node(node_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        n = conn(x_os_token).baremetal.get_node(node_id)
        if not n: raise HTTPException(404, "Node not found")
        return serialize(n)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/nodes", status_code=201)
async def create_node(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        n = conn(x_os_token).baremetal.create_node(
            driver=body["driver"],
            name=body.get("name"),
            driver_info=body.get("driver_info", {}),
            properties=body.get("properties", {}),
            resource_class=body.get("resource_class"),
        )
        return serialize(n)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/nodes/{node_id}", status_code=204)
async def delete_node(node_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).baremetal.delete_node(node_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.put("/nodes/{node_id}/provision")
async def set_provision_state(node_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        target = body["target"]  # active, deleted, inspect, manage, provide, etc.
        conn(x_os_token).baremetal.set_node_provision_state(node_id, target)
        return {"message": f"Provision state set to '{target}'"}
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.put("/nodes/{node_id}/power")
async def set_power_state(node_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        target = body["target"]  # power on, power off, rebooting
        conn(x_os_token).baremetal.set_node_power_state(node_id, target)
        return {"message": f"Power state set to '{target}'"}
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.put("/nodes/{node_id}/maintenance")
async def set_maintenance(node_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).baremetal.set_node_maintenance(
            node_id, reason=body.get("reason", "")
        )
        return {"message": "Node set to maintenance"}
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/nodes/{node_id}/maintenance", status_code=204)
async def unset_maintenance(node_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).baremetal.unset_node_maintenance(node_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Ports ───────────────────────────────────────────────────────────────────

@router.get("/nodes/{node_id}/ports")
async def list_node_ports(node_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(p) for p in conn(x_os_token).baremetal.ports(node_id=node_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/ports", status_code=201)
async def create_port(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        p = conn(x_os_token).baremetal.create_port(
            node_id=body["node_id"],
            address=body["address"],
        )
        return serialize(p)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Chassis ─────────────────────────────────────────────────────────────────

@router.get("/chassis")
async def list_chassis(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(c) for c in conn(x_os_token).baremetal.chassis()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Drivers ─────────────────────────────────────────────────────────────────

@router.get("/drivers")
async def list_drivers(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(d) for d in conn(x_os_token).baremetal.drivers()]
    except Exception as e:
        raise HTTPException(502, str(e))
