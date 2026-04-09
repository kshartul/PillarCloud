from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime
from database import get_db
from models.models import AuditEvent
from schemas.schemas import AuditEventCreate, AuditEventResponse

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("", response_model=dict)
async def list_events(
    page:          int      = Query(1, ge=1),
    limit:         int      = Query(50, ge=1, le=200),
    username:      Optional[str] = None,
    action:        Optional[str] = None,
    resource_type: Optional[str] = None,
    status:        Optional[str] = None,
    from_date:     Optional[datetime] = None,
    to_date:       Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(AuditEvent)
    if username:      q = q.where(AuditEvent.username.ilike(f"%{username}%"))
    if action:        q = q.where(AuditEvent.action == action)
    if resource_type: q = q.where(AuditEvent.resource_type == resource_type)
    if status:        q = q.where(AuditEvent.status == status)
    if from_date:     q = q.where(AuditEvent.created_at >= from_date)
    if to_date:       q = q.where(AuditEvent.created_at <= to_date)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar()
    q = q.order_by(AuditEvent.created_at.desc()).offset((page - 1) * limit).limit(limit)
    rows = (await db.execute(q)).scalars().all()
    return {"data": [AuditEventResponse.model_validate(r) for r in rows], "total": total, "page": page, "limit": limit}

@router.post("", response_model=AuditEventResponse, status_code=201)
async def create_event(body: AuditEventCreate, db: AsyncSession = Depends(get_db)):
    event = AuditEvent(**body.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event
