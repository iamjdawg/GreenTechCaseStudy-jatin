from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, date, timezone
import enum


def _utcnow():
    return datetime.now(timezone.utc)

from .database import Base


class ItemStatus(str, enum.Enum):
    active = "active"
    low = "low"
    expired = "expired"
    finished = "finished"


class UsageReason(str, enum.Enum):
    consumed = "consumed"
    expired = "expired"
    damaged = "damaged"
    other = "other"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, default="📦")

    items = relationship("InventoryItem", back_populates="category")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    quantity = Column(Float, nullable=False, default=0)
    unit = Column(String, nullable=False, default="units")
    cost_per_unit = Column(Float, default=0.0)
    expiry_date = Column(Date, nullable=True)
    status = Column(String, default=ItemStatus.active.value)
    added_date = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)
    notes = Column(String, default="")

    category = relationship("Category", back_populates="items")
    usage_logs = relationship("UsageLog", back_populates="item", cascade="all, delete-orphan")


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    quantity_used = Column(Float, nullable=False)
    used_date = Column(DateTime, default=_utcnow)
    reason = Column(String, default=UsageReason.consumed.value)
    notes = Column(String, default="")

    item = relationship("InventoryItem", back_populates="usage_logs")
