from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/workflow", tags=["workflow (Mistral)"])

def conn(token): return get_connection(token)

# ─── Workflows ───────────────────────────────────────────────────────────────

@router.get("/workflows")
async def list_workflows(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(w) for w in conn(x_os_token).workflow.workflows()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        w = conn(x_os_token).workflow.get_workflow(workflow_id)
        if not w: raise HTTPException(404, "Workflow not found")
        return serialize(w)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/workflows", status_code=201)
async def create_workflow(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        w = conn(x_os_token).workflow.create_workflow(
            definition=body["definition"],
            scope=body.get("scope", "private"),
        )
        return serialize(w)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/workflows/{workflow_id}", status_code=204)
async def delete_workflow(workflow_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).workflow.delete_workflow(workflow_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Executions ──────────────────────────────────────────────────────────────

@router.get("/executions")
async def list_executions(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(e) for e in conn(x_os_token).workflow.executions()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/executions/{execution_id}")
async def get_execution(execution_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        e = conn(x_os_token).workflow.get_execution(execution_id)
        if not e: raise HTTPException(404, "Execution not found")
        return serialize(e)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/executions", status_code=201)
async def create_execution(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        e = conn(x_os_token).workflow.create_execution(
            workflow_name=body["workflow_name"],
            input=body.get("input", {}),
            params=body.get("params", {}),
            description=body.get("description", ""),
        )
        return serialize(e)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/executions/{execution_id}", status_code=204)
async def delete_execution(execution_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).workflow.delete_execution(execution_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Actions ─────────────────────────────────────────────────────────────────

@router.get("/actions")
async def list_actions(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(a) for a in conn(x_os_token).workflow.actions()]
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Cron Triggers ───────────────────────────────────────────────────────────

@router.get("/cron-triggers")
async def list_cron_triggers(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(t) for t in conn(x_os_token).workflow.cron_triggers()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/cron-triggers", status_code=201)
async def create_cron_trigger(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        t = conn(x_os_token).workflow.create_cron_trigger(
            name=body["name"],
            workflow_name=body["workflow_name"],
            pattern=body["pattern"],
            workflow_input=body.get("workflow_input", {}),
        )
        return serialize(t)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/cron-triggers/{trigger_name}", status_code=204)
async def delete_cron_trigger(trigger_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).workflow.delete_cron_trigger(trigger_name)
    except Exception as e:
        raise HTTPException(502, str(e))
