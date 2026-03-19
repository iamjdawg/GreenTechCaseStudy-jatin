import csv
import os
import random
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session

from ..models import InventoryItem, UsageLog, Category
from .. import crud


def seed_database(db: Session):
    """Seed the database with sample inventory and usage logs."""
    # Don't re-seed if data exists
    if db.query(InventoryItem).count() > 0:
        return {"message": "Database already seeded", "items": 0, "logs": 0}

    crud.seed_categories(db)

    # Load categories into a lookup
    categories = {c.name: c.id for c in db.query(Category).all()}

    # Load CSV
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_inventory.csv")
    csv_path = os.path.normpath(csv_path)

    items_created = 0
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            expiry_offset = int(row["expiry_days_from_now"])
            expiry_date = date.today() + timedelta(days=expiry_offset)
            cat_id = categories.get(row["category"])

            item = InventoryItem(
                name=row["name"],
                category_id=cat_id,
                quantity=float(row["quantity"]),
                unit=row["unit"],
                cost_per_unit=float(row["cost_per_unit"]),
                expiry_date=expiry_date,
                notes=row["notes"],
                added_date=datetime.now(timezone.utc) - timedelta(days=random.randint(5, 30)),
            )
            # Set status
            if expiry_date < date.today():
                item.status = "expired"
            elif expiry_date <= date.today() + timedelta(days=3):
                item.status = "low"
            else:
                item.status = "active"

            db.add(item)
            items_created += 1

    db.commit()

    # Generate usage logs
    all_items = db.query(InventoryItem).all()
    logs_created = 0
    reasons = ["consumed", "consumed", "consumed", "consumed", "expired", "damaged"]

    for item in all_items:
        # Generate 2-4 usage log entries per item over the past 14 days
        num_logs = random.randint(1, 4)
        for _ in range(num_logs):
            days_ago = random.randint(0, 13)
            used_date = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 12))
            reason = random.choice(reasons)
            qty = round(random.uniform(0.5, max(1, item.quantity * 0.3)), 1)

            log = UsageLog(
                item_id=item.id,
                quantity_used=qty,
                used_date=used_date,
                reason=reason,
                notes="",
            )
            db.add(log)
            logs_created += 1

    db.commit()
    return {"message": "Database seeded successfully", "items": items_created, "logs": logs_created}
