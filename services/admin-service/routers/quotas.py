from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import Quota
from schemas.schemas import QuotaUpdate, QuotaResponse

router = APIRouter(prefix="/quotas", tags=["quotas"])

@router.get("/{project_id}", response_model=QuotaResponse)
async def get_quota(project_id: str, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(select(Quota).where(Quota.project_id == project_id))).scalar_one_or_none()
    if not row:
        # Return default quota
        row = Quota(project_id=project_id)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row

@router.put("/{project_id}", response_model=QuotaResponse)
async def set_quota(project_id: str, body: QuotaUpdate, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(select(Quota).where(Quota.project_id == project_id))).scalar_one_or_none()
    if not row:
        row = Quota(project_id=project_id)
        db.add(row)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(row, k, v)
    await db.commit()
    await db.refresh(row)
    return row

@router.get("", response_model=list)
async def list_quotas(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Quota))).scalars().all()
    return [QuotaResponse.model_validate(r) for r in rows]
