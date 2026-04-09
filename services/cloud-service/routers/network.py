from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/network", tags=["network"])

def conn(token): return get_connection(token)

@router.get("/networks")
async def list_networks(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(n) for n in conn(x_os_token).network.networks()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/networks", status_code=201)
async def create_network(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        net = c.network.create_network(name=body["name"], is_shared=body.get("shared", False), is_admin_state_up=True)
        if body.get("cidr"):
            c.network.create_subnet(
                network_id=net.id,
                name=f"{body['name']}-subnet",
                ip_version=4,
                cidr=body["cidr"],
                dns_nameservers=body.get("dns", ["8.8.8.8", "8.8.4.4"]),
            )
        return serialize(net)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/networks/{network_id}", status_code=204)
async def delete_network(network_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).network.delete_network(network_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/subnets")
async def list_subnets(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).network.subnets()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/routers")
async def list_routers(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(r) for r in conn(x_os_token).network.routers()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/floating-ips")
async def list_floating_ips(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(f) for f in conn(x_os_token).network.ips()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/floating-ips", status_code=201)
async def allocate_floating_ip(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        fip = conn(x_os_token).network.create_ip(floating_network_id=body["network_id"])
        return serialize(fip)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/floating-ips/{fip_id}", status_code=204)
async def release_floating_ip(fip_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).network.delete_ip(fip_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/floating-ips/{fip_id}/associate")
async def associate_floating_ip(fip_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        c.compute.add_floating_ip_to_server(body["server_id"], body["address"])
        return {"message": "Floating IP associated"}
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/floating-ips/{fip_id}/disassociate")
async def disassociate_floating_ip(fip_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        c.compute.remove_floating_ip_from_server(body["server_id"], body["address"])
        return {"message": "Floating IP disassociated"}
    except Exception as e:
        raise HTTPException(502, str(e))
