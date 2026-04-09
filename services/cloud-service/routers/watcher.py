from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/optimization", tags=["optimization (Watcher)"])

def conn(token): return get_connection(token)

# ─── Audit Templates ────────────────────────────────────────────────────────

@router.get("/audit-templates")
async def list_audit_templates(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(at) for at in conn(x_os_token).infra_optim.audit_templates()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/audit-templates", status_code=201)
async def create_audit_template(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        at = conn(x_os_token).infra_optim.create_audit_template(
            name=body["name"],
            goal=body["goal"],
            strategy=body.get("strategy"),
            description=body.get("description", ""),
        )
        return serialize(at)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/audit-templates/{template_id}", status_code=204)
async def delete_audit_template(template_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).infra_optim.delete_audit_template(template_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Audits ──────────────────────────────────────────────────────────────────

@router.get("/audits")
async def list_audits(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(a) for a in conn(x_os_token).infra_optim.audits()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/audits/{audit_id}")
async def get_audit(audit_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        a = conn(x_os_token).infra_optim.get_audit(audit_id)
        if not a: raise HTTPException(404, "Audit not found")
        return serialize(a)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/audits", status_code=201)
async def create_audit(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        a = conn(x_os_token).infra_optim.create_audit(
            audit_template_id=body["audit_template_id"],
            audit_type=body.get("audit_type", "ONESHOT"),
            interval=body.get("interval"),
        )
        return serialize(a)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/audits/{audit_id}", status_code=204)
async def delete_audit(audit_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).infra_optim.delete_audit(audit_id)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Action Plans ────────────────────────────────────────────────────────────

@router.get("/action-plans")
async def list_action_plans(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(ap) for ap in conn(x_os_token).infra_optim.action_plans()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/action-plans/{plan_id}")
async def get_action_plan(plan_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        ap = conn(x_os_token).infra_optim.get_action_plan(plan_id)
        if not ap: raise HTTPException(404, "Action plan not found")
        return serialize(ap)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/action-plans/{plan_id}/start")
async def start_action_plan(plan_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).infra_optim.start_action_plan(plan_id)
        return {"message": "Action plan started"}
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Goals & Strategies ─────────────────────────────────────────────────────

@router.get("/goals")
async def list_goals(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(g) for g in conn(x_os_token).infra_optim.goals()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/strategies")
async def list_strategies(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).infra_optim.strategies()]
    except Exception as e:
        raise HTTPException(502, str(e))
