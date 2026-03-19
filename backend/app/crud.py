from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, date, timedelta, timezone
from typing import Optional

from .models import Category, InventoryItem, UsageLog, ItemStatus


# --- Categories ---
def get_categories(db: Session):
    return db.query(Category).order_by(Category.name).all()


def get_or_create_category(db: Session, name: str, icon: str = "📦"):
    cat = db.query(Category).filter(Category.name == name).first()
    if not cat:
        cat = Category(name=name, icon=icon)
        db.add(cat)
        db.commit()
        db.refresh(cat)
    return cat


def seed_categories(db: Session):
    defaults = [
        ("Dairy", "🥛"), ("Produce", "🥬"), ("Meat", "🥩"),
        ("Bakery", "🍞"), ("Beverages", "🧃"), ("Coffee", "☕"),
        ("Condiments", "🫙"), ("Dry Goods", "🌾"), ("Frozen", "🧊"),
        ("Other", "📦"),
    ]
    for name, icon in defaults:
        get_or_create_category(db, name, icon)


# --- Inventory Items ---
def get_items(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    sort_by: str = "expiry_date",
    skip: int = 0,
    limit: int = 100,
):
    q = db.query(InventoryItem)
    if search:
        q = q.filter(InventoryItem.name.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(InventoryItem.category_id == category_id)
    if status:
        q = q.filter(InventoryItem.status == status)

    sort_map = {
        "expiry_date": InventoryItem.expiry_date.asc().nullslast(),
        "name": InventoryItem.name.asc(),
        "quantity": InventoryItem.quantity.desc(),
        "added_date": InventoryItem.added_date.desc(),
    }
    q = q.order_by(sort_map.get(sort_by, InventoryItem.expiry_date.asc().nullslast()))
    return q.offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int):
    return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()


def create_item(db: Session, **kwargs):
    item = InventoryItem(**kwargs)
    _update_item_status(item)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, item_id: int, **kwargs):
    item = get_item(db, item_id)
    if not item:
        return None
    for k, v in kwargs.items():
        if v is not None:
            setattr(item, k, v)
    item.updated_at = datetime.now(timezone.utc)
    _update_item_status(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int):
    item = get_item(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def get_expiring_items(db: Session, days: int = 7):
    cutoff = date.today() + timedelta(days=days)
    return (
        db.query(InventoryItem)
        .filter(
            InventoryItem.expiry_date <= cutoff,
            InventoryItem.expiry_date >= date.today(),
            InventoryItem.quantity > 0,
        )
        .order_by(InventoryItem.expiry_date.asc())
        .all()
    )


def _update_item_status(item: InventoryItem):
    if item.quantity <= 0:
        item.status = ItemStatus.finished.value
    elif item.expiry_date and item.expiry_date < date.today():
        item.status = ItemStatus.expired.value
    elif item.expiry_date and item.expiry_date <= date.today() + timedelta(days=3):
        item.status = ItemStatus.low.value
    else:
        item.status = ItemStatus.active.value


# --- Usage Logs ---
def create_usage(db: Session, item_id: int, quantity_used: float, reason: str = "consumed", notes: str = ""):
    item = get_item(db, item_id)
    if not item:
        return None
    log = UsageLog(
        item_id=item_id,
        quantity_used=quantity_used,
        reason=reason,
        notes=notes,
        used_date=datetime.now(timezone.utc),
    )
    db.add(log)
    item.quantity = max(0, item.quantity - quantity_used)
    item.updated_at = datetime.now(timezone.utc)
    _update_item_status(item)
    db.commit()
    db.refresh(log)
    return log


def get_usage_logs(db: Session, item_id: int):
    return (
        db.query(UsageLog)
        .filter(UsageLog.item_id == item_id)
        .order_by(UsageLog.used_date.desc())
        .all()
    )


def get_all_usage_logs(db: Session, days: int = 30):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    return (
        db.query(UsageLog)
        .filter(UsageLog.used_date >= since)
        .order_by(UsageLog.used_date.desc())
        .all()
    )
