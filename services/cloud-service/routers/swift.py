from fastapi import APIRouter, Header, HTTPException, UploadFile, File, Form
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/object-storage", tags=["object-storage (Swift)"])

def conn(token): return get_connection(token)

# ─── Containers ──────────────────────────────────────────────────────────────

@router.get("/containers")
async def list_containers(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(c) for c in conn(x_os_token).object_store.containers()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/containers", status_code=201)
async def create_container(name: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).object_store.create_container(name=name)
        return serialize(c)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/containers/{container_name}", status_code=204)
async def delete_container(container_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).object_store.delete_container(container_name)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/containers/{container_name}/metadata")
async def get_container_metadata(container_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token).object_store.get_container_metadata(container_name)
        return serialize(c)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Objects ─────────────────────────────────────────────────────────────────

@router.get("/containers/{container_name}/objects")
async def list_objects(container_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(o) for o in conn(x_os_token).object_store.objects(container_name)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/containers/{container_name}/objects", status_code=201)
async def upload_object(
    container_name: str,
    file: UploadFile = File(...),
    object_name: Optional[str] = Form(None),
    x_os_token: Optional[str] = Header(None),
):
    try:
        name = object_name or file.filename
        data = await file.read()
        obj = conn(x_os_token).object_store.upload_object(
            container=container_name, name=name, data=data,
        )
        return serialize(obj)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/containers/{container_name}/objects/{object_name:path}", status_code=204)
async def delete_object(container_name: str, object_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).object_store.delete_object(object_name, container=container_name)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/containers/{container_name}/objects/{object_name:path}/metadata")
async def get_object_metadata(container_name: str, object_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        obj = conn(x_os_token).object_store.get_object_metadata(object_name, container=container_name)
        return serialize(obj)
    except Exception as e:
        raise HTTPException(502, str(e))
