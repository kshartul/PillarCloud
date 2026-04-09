from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class Project(Base):
    __tablename__ = "projects"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    os_project_id = Column(String(255), unique=True)
    enabled     = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

class Quota(Base):
    __tablename__ = "quotas"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(String(255), nullable=False, index=True)
    # Compute
    instances  = Column(Integer, default=10)
    vcpus      = Column(Integer, default=20)
    ram        = Column(Integer, default=51200)   # MB
    # Storage
    volumes    = Column(Integer, default=10)
    gigabytes  = Column(Integer, default=1000)
    snapshots  = Column(Integer, default=10)
    # Network
    floating_ips    = Column(Integer, default=5)
    security_groups = Column(Integer, default=10)
    networks        = Column(Integer, default=5)
    routers         = Column(Integer, default=5)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id       = Column(String(255))
    username      = Column(String(255))
    action        = Column(String(100), nullable=False)
    resource_type = Column(String(100))
    resource_id   = Column(String(255))
    resource_name = Column(String(255))
    status        = Column(String(20), default="success")
    ip_address    = Column(String(50))
    extra         = Column(JSON)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
