from fastapi import APIRouter, Header, HTTPException, Body, UploadFile, File
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/images", tags=["images"])

def conn(token): return get_connection(token)

@router.get("")
async def list_images(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(i) for i in conn(x_os_token).image.images()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/{image_id}")
async def get_image(image_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        img = conn(x_os_token).image.get_image(image_id)
        if not img: raise HTTPException(404, "Image not found")
        return serialize(img)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/{image_id}", status_code=204)
async def delete_image(image_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).image.delete_image(image_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("", status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    name: str = "uploaded-image",
    disk_format: str = "qcow2",
    container_format: str = "bare",
    x_os_token: Optional[str] = Header(None),
):
    try:
        c = conn(x_os_token)
        img = c.image.create_image(
            name=name,
            disk_format=disk_format,
            container_format=container_format,
            visibility="private",
        )
        c.image.upload_image(img.id, await file.read())
        return serialize(c.image.get_image(img.id))
    except Exception as e:
        raise HTTPException(502, str(e))
