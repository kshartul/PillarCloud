from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

# ── Project ───────────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    os_project_id: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None

class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    os_project_id: Optional[str]
    enabled: bool
    created_at: datetime
    class Config: from_attributes = True

# ── Quota ────────────────────────────────────────────────────────────────────
class QuotaUpdate(BaseModel):
    instances: Optional[int] = None
    vcpus: Optional[int] = None
    ram: Optional[int] = None
    volumes: Optional[int] = None
    gigabytes: Optional[int] = None
    snapshots: Optional[int] = None
    floating_ips: Optional[int] = None
    security_groups: Optional[int] = None
    networks: Optional[int] = None
    routers: Optional[int] = None

class QuotaResponse(BaseModel):
    id: UUID
    project_id: str
    instances: int
    vcpus: int
    ram: int
    volumes: int
    gigabytes: int
    snapshots: int
    floating_ips: int
    security_groups: int
    networks: int
    routers: int
    updated_at: Optional[datetime]
    class Config: from_attributes = True

# ── Audit ─────────────────────────────────────────────────────────────────────
class AuditEventCreate(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    resource_name: Optional[str] = None
    status: str = "success"
    ip_address: Optional[str] = None
    extra: Optional[Any] = None

class AuditEventResponse(BaseModel):
    id: UUID
    user_id: Optional[str]
    username: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    resource_name: Optional[str]
    status: str
    ip_address: Optional[str]
    created_at: datetime
    class Config: from_attributes = True

# ── Pagination ────────────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    limit: int
