from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/orchestration", tags=["orchestration (Heat)"])

def conn(token): return get_connection(token)

# ─── Stacks ──────────────────────────────────────────────────────────────────

@router.get("/stacks")
async def list_stacks(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).orchestration.stacks()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/stacks/{stack_id}")
async def get_stack(stack_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).orchestration.get_stack(stack_id)
        if not s: raise HTTPException(404, "Stack not found")
        return serialize(s)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/stacks", status_code=201)
async def create_stack(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).orchestration.create_stack(
            name=body["name"],
            template=body.get("template"),
            template_url=body.get("template_url"),
            parameters=body.get("parameters", {}),
            environment=body.get("environment"),
            timeout_mins=body.get("timeout_mins", 60),
        )
        return serialize(s)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.put("/stacks/{stack_id}")
async def update_stack(stack_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).orchestration.update_stack(
            stack_id,
            template=body.get("template"),
            template_url=body.get("template_url"),
            parameters=body.get("parameters", {}),
            environment=body.get("environment"),
        )
        return serialize(s) if s else {"message": "Stack update initiated"}
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/stacks/{stack_id}", status_code=204)
async def delete_stack(stack_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).orchestration.delete_stack(stack_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/stacks/{stack_id}/resources")
async def list_stack_resources(stack_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(r) for r in conn(x_os_token).orchestration.resources(stack_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/stacks/{stack_id}/events")
async def list_stack_events(stack_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(e) for e in conn(x_os_token).orchestration.events(stack_id)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/stacks/{stack_id}/template")
async def get_stack_template(stack_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        t = conn(x_os_token).orchestration.get_stack_template(stack_id)
        return t
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/validate")
async def validate_template(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        result = conn(x_os_token).orchestration.validate_template(
            template=body.get("template"),
            template_url=body.get("template_url"),
        )
        return result
    except Exception as e:
        raise HTTPException(502, str(e))
