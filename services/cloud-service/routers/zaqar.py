from fastapi import APIRouter, Header, HTTPException, Body
from typing import Optional
from openstack_client import get_connection, serialize

router = APIRouter(prefix="/messaging", tags=["messaging (Zaqar)"])

def conn(token): return get_connection(token)

# ─── Queues ──────────────────────────────────────────────────────────────────

@router.get("/queues")
async def list_queues(x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(q) for q in conn(x_os_token).message.queues()]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/queues", status_code=201)
async def create_queue(body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        q = conn(x_os_token).message.create_queue(
            name=body["name"],
            metadata=body.get("metadata", {}),
        )
        return serialize(q)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/queues/{queue_name}", status_code=204)
async def delete_queue(queue_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).message.delete_queue(queue_name)
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Messages ────────────────────────────────────────────────────────────────

@router.get("/queues/{queue_name}/messages")
async def list_messages(queue_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(m) for m in conn(x_os_token).message.messages(queue_name)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/queues/{queue_name}/messages", status_code=201)
async def post_messages(queue_name: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        msgs = body.get("messages", [])
        result = conn(x_os_token).message.post_message(queue_name, messages=msgs)
        return {"posted": len(msgs)}
    except Exception as e:
        raise HTTPException(502, str(e))

# ─── Subscriptions ───────────────────────────────────────────────────────────

@router.get("/queues/{queue_name}/subscriptions")
async def list_subscriptions(queue_name: str, x_os_token: Optional[str] = Header(None)):
    try:
        return [serialize(s) for s in conn(x_os_token).message.subscriptions(queue_name)]
    except Exception as e:
        raise HTTPException(502, str(e))

@router.post("/queues/{queue_name}/subscriptions", status_code=201)
async def create_subscription(queue_name: str, body: dict = Body(...), x_os_token: Optional[str] = Header(None)):
    try:
        s = conn(x_os_token).message.create_subscription(
            queue_name,
            subscriber=body["subscriber"],
            ttl=body.get("ttl", 3600),
            options=body.get("options", {}),
        )
        return serialize(s)
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(502, str(e))

@router.delete("/queues/{queue_name}/subscriptions/{subscription_id}", status_code=204)
async def delete_subscription(queue_name: str, subscription_id: str, x_os_token: Optional[str] = Header(None)):
    try:
        conn(x_os_token).message.delete_subscription(queue_name, subscription_id)
    except Exception as e:
        raise HTTPException(502, str(e))
