from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models.models import Project
from schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=dict)
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Project)
    if search:
        q = q.where(Project.name.ilike(f"%{search}%"))
    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar()
    q = q.offset((page - 1) * limit).limit(limit)
    rows = (await db.execute(q)).scalars().all()
    return {"data": [ProjectResponse.model_validate(r) for r in rows], "total": total, "page": page, "limit": limit}

@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    proj = Project(**body.model_dump())
    db.add(proj)
    await db.commit()
    await db.refresh(proj)
    return proj

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, "Project not found")
    return row

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, body: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, "Project not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(row, k, v)
    await db.commit()
    await db.refresh(row)
    return row

@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if not row:
        raise HTTPException(404, "Project not found")
    await db.delete(row)
    await db.commit()
