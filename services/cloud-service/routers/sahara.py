from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/data-processing", tags=["data-processing (Sahara)"])

def conn(token): return get_connection(token)

# ─── Clusters ────────────────────────────────────────────────────────────────

@router.get("/clusters")
async def list_clusters(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(c) for c in conn(x_os_token).data_processing.clusters()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/clusters/{cluster_id}")
async def get_cluster(cluster_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).data_processing.get_cluster(cluster_id)
        if not c: raise HTTPException(404, "Cluster not found")
        return serialize(c)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/clusters", status_code=201)
async def create_cluster(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).data_processing.create_cluster(
            name=body["name"],
            plugin_name=body["plugin_name"],
            hadoop_version=body["hadoop_version"],
            cluster_template_id=body["cluster_template_id"],
            default_image_id=body["default_image_id"],
            neutron_management_network=body.get("neutron_management_network"),
        )
        return serialize(c)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/clusters/{cluster_id}", status_code=204)
async def delete_cluster(cluster_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).data_processing.delete_cluster(cluster_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/clusters/{cluster_id}/scale")
async def scale_cluster(cluster_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).data_processing.scale_cluster(
            cluster_id, body.get("add_node_groups", [])
        )
        return serialize(c) if c else {"message": "Scale initiated"}
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Cluster Templates ──────────────────────────────────────────────────────

@router.get("/cluster-templates")
async def list_cluster_templates(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(ct) for ct in conn(x_os_token).data_processing.cluster_templates()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/cluster-templates", status_code=201)
async def create_cluster_template(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        ct = conn(x_os_token).data_processing.create_cluster_template(
            name=body["name"],
            plugin_name=body["plugin_name"],
            hadoop_version=body["hadoop_version"],
            node_groups=body.get("node_groups", []),
        )
        return serialize(ct)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/cluster-templates/{template_id}", status_code=204)
async def delete_cluster_template(template_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).data_processing.delete_cluster_template(template_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Node Group Templates ───────────────────────────────────────────────────

@router.get("/node-group-templates")
async def list_node_group_templates(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(n) for n in conn(x_os_token).data_processing.node_group_templates()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Jobs ────────────────────────────────────────────────────────────────────

@router.get("/jobs")
async def list_jobs(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(j) for j in conn(x_os_token).data_processing.jobs()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/jobs", status_code=201)
async def create_job(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        j = conn(x_os_token).data_processing.create_job(
            name=body["name"],
            type=body["type"],
            mains=body.get("mains", []),
            libs=body.get("libs", []),
            description=body.get("description", ""),
        )
        return serialize(j)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Plugins ────────────────────────────────────────────────────────────────

@router.get("/plugins")
async def list_plugins(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(p) for p in conn(x_os_token).data_processing.plugins()]
    except Exception as e:
        raise HTTPException(502, str(e))
