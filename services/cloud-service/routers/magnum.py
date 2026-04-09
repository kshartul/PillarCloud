from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/container-infra", tags=["container-infra (Magnum)"])

def conn(token): return get_connection(token)

# ─── Cluster Templates ───────────────────────────────────────────────────────

@router.get("/cluster-templates")
async def list_cluster_templates(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(ct) for ct in conn(x_os_token).container_infrastructure_management.cluster_templates()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/cluster-templates/{template_id}")
async def get_cluster_template(template_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        ct = conn(x_os_token).container_infrastructure_management.get_cluster_template(template_id)
        if not ct: raise HTTPException(404, "Cluster template not found")
        return serialize(ct)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/cluster-templates", status_code=201)
async def create_cluster_template(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        ct = conn(x_os_token).container_infrastructure_management.create_cluster_template(
            name=body["name"],
            image_id=body["image_id"],
            keypair_id=body.get("keypair_id"),
            coe=body.get("coe", "kubernetes"),
            flavor_id=body.get("flavor_id"),
            master_flavor_id=body.get("master_flavor_id"),
            external_network_id=body.get("external_network_id"),
            dns_nameserver=body.get("dns_nameserver", "8.8.8.8"),
            network_driver=body.get("network_driver", "flannel"),
            docker_volume_size=body.get("docker_volume_size", 50),
        )
        return serialize(ct)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/cluster-templates/{template_id}", status_code=204)
async def delete_cluster_template(template_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).container_infrastructure_management.delete_cluster_template(template_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Clusters ────────────────────────────────────────────────────────────────

@router.get("/clusters")
async def list_clusters(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(c) for c in conn(x_os_token).container_infrastructure_management.clusters()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/clusters/{cluster_id}")
async def get_cluster(cluster_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).container_infrastructure_management.get_cluster(cluster_id)
        if not c: raise HTTPException(404, "Cluster not found")
        return serialize(c)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/clusters", status_code=201)
async def create_cluster(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).container_infrastructure_management.create_cluster(
            name=body["name"],
            cluster_template_id=body["cluster_template_id"],
            master_count=body.get("master_count", 1),
            node_count=body.get("node_count", 1),
            keypair=body.get("keypair"),
            create_timeout=body.get("create_timeout", 60),
        )
        return serialize(c)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/clusters/{cluster_id}", status_code=204)
async def delete_cluster(cluster_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).container_infrastructure_management.delete_cluster(cluster_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/clusters/{cluster_id}/resize")
async def resize_cluster(cluster_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).container_infrastructure_management.resize_cluster(
            cluster_id, node_count=body["node_count"]
        )
        return serialize(c) if c else {"message": "Resize initiated"}
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))
