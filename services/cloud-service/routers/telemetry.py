from fastapi import APIRouter, Header, HTTPException, Body, Query
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/telemetry", tags=["telemetry (Aodh/Ceilometer/Gnocchi)"])

def conn(token): return get_connection(token)

# ─── Alarms (Aodh) ──────────────────────────────────────────────────────────

@router.get("/alarms")
async def list_alarms(x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        try:
            alarms = list(c.alarm.alarms())
        except AttributeError:
            alarms = list(c.alarming.alarms())
        return [serialize(a) for a in alarms]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/alarms/{alarm_id}")
async def get_alarm(alarm_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        try:
            a = c.alarm.get_alarm(alarm_id)
        except AttributeError:
            a = c.alarming.get_alarm(alarm_id)
        if not a: raise HTTPException(404, "Alarm not found")
        return serialize(a)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/alarms", status_code=201)
async def create_alarm(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        kwargs = {
            "name": body["name"],
            "type": body.get("type", "threshold"),
            "description": body.get("description", ""),
            "severity": body.get("severity", "moderate"),
            "enabled": body.get("enabled", True),
            "alarm_actions": body.get("alarm_actions", []),
            "ok_actions": body.get("ok_actions", []),
            "insufficient_data_actions": body.get("insufficient_data_actions", []),
        }
        if body.get("type") == "threshold":
            kwargs["threshold_rule"] = body.get("threshold_rule", {})
        elif body.get("type") == "gnocchi_resources_threshold":
            kwargs["gnocchi_resources_threshold_rule"] = body.get("gnocchi_resources_threshold_rule", {})
        try:
            a = c.alarm.create_alarm(**kwargs)
        except AttributeError:
            a = c.alarming.create_alarm(**kwargs)
        return serialize(a)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/alarms/{alarm_id}", status_code=204)
async def delete_alarm(alarm_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        try:
            c.alarm.delete_alarm(alarm_id)
        except AttributeError:
            c.alarming.delete_alarm(alarm_id)
    except Exception as e:
        raise HTTPException(502, str(e))

@router.put("/alarms/{alarm_id}/state")
async def set_alarm_state(alarm_id: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        c = conn(x_os_token)
        state = body["state"]  # ok, alarm, insufficient data
        try:
            c.alarm.update_alarm(alarm_id, state=state)
        except AttributeError:
            c.alarming.update_alarm(alarm_id, state=state)
        return {"alarm_id": alarm_id, "state": state}
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Metrics (Gnocchi) ───────────────────────────────────────────────────────

@router.get("/metrics")
async def list_metrics(
    resource_id: Optional[str] = Query(None),
    x_os_token: Optional[str] = Header(None),
):
    try:
        import httpx
        c = conn(x_os_token)
        # Gnocchi doesn't have a direct openstacksdk proxy for all endpoints
        # Use the catalog to find the endpoint
        endpoint = None
        for svc in c.identity.services():
            if svc.type == "metric":
                endpoints = list(c.identity.endpoints(service_id=svc.id, interface="public"))
                if endpoints:
                    endpoint = endpoints[0].url
                break
        if not endpoint:
            return {"error": "Gnocchi metric service not found in catalog", "metrics": []}
        headers = {"X-Auth-Token": c.auth_token}
        url = f"{endpoint}/v1/metric"
        if resource_id:
            url = f"{endpoint}/v1/resource/generic/{resource_id}/metric"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=30)
            return resp.json()
    except Exception as e:
        raise HTTPException(502, str(e))

@router.get("/resources")
async def list_resources(
    resource_type: str = Query("generic"),
    x_os_token: Optional[str] = Header(None),
):
    try:
        import httpx
        c = conn(x_os_token)
        endpoint = None
        for svc in c.identity.services():
            if svc.type == "metric":
                endpoints = list(c.identity.endpoints(service_id=svc.id, interface="public"))
                if endpoints:
                    endpoint = endpoints[0].url
                break
        if not endpoint:
            return {"error": "Gnocchi metric service not found", "resources": []}
        headers = {"X-Auth-Token": c.auth_token}
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{endpoint}/v1/resource/{resource_type}", headers=headers, timeout=30
            )
            return resp.json()
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Samples (Ceilometer — legacy, if available) ────────────────────────────

@router.get("/samples")
async def list_samples(
    meter_name: str = Query(...),
    limit: int = Query(100),
    x_os_token: Optional[str] = Header(None),
):
    """Legacy Ceilometer samples endpoint — returns empty if Ceilometer is not deployed."""
    try:
        import httpx
        c = conn(x_os_token)
        endpoint = None
        for svc in c.identity.services():
            if svc.type == "metering":
                endpoints = list(c.identity.endpoints(service_id=svc.id, interface="public"))
                if endpoints:
                    endpoint = endpoints[0].url
                break
        if not endpoint:
            return []
        headers = {"X-Auth-Token": c.auth_token}
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{endpoint}/v2/samples",
                params={"q.field": "meter", "q.value": meter_name, "limit": limit},
                headers=headers, timeout=30,
            )
            return resp.json()
    except Exception as e:
        raise HTTPException(502, str(e))
