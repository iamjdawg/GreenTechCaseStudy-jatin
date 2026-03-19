from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import InventoryItem, UsageLog, Category
from ..schemas import DashboardStats, WasteData, ReorderSuggestion, SustainabilityScore


def get_dashboard_stats(db: Session) -> DashboardStats:
    total = db.query(func.count(InventoryItem.id)).filter(InventoryItem.quantity > 0).scalar() or 0
    today = date.today()
    soon = today + timedelta(days=7)
    expiring = (
        db.query(func.count(InventoryItem.id))
        .filter(InventoryItem.expiry_date <= soon, InventoryItem.expiry_date >= today, InventoryItem.quantity > 0)
        .scalar() or 0
    )
    expired = (
        db.query(func.count(InventoryItem.id))
        .filter(InventoryItem.expiry_date < today, InventoryItem.quantity > 0)
        .scalar() or 0
    )
    total_value = (
        db.query(func.sum(InventoryItem.quantity * InventoryItem.cost_per_unit))
        .filter(InventoryItem.quantity > 0)
        .scalar() or 0.0
    )
    start_of_day = datetime.combine(today, datetime.min.time())
    used_today = (
        db.query(func.count(UsageLog.id))
        .filter(UsageLog.used_date >= start_of_day)
        .scalar() or 0
    )
    return DashboardStats(
        total_items=total,
        expiring_soon=expiring,
        expired_count=expired,
        total_value=round(total_value, 2),
        items_used_today=used_today,
    )


def get_waste_data(db: Session, days: int = 30) -> WasteData:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    waste_logs = (
        db.query(UsageLog)
        .filter(UsageLog.used_date >= since, UsageLog.reason.in_(["expired", "damaged"]))
        .all()
    )
    total_wasted = sum(l.quantity_used for l in waste_logs)

    # Calculate wasted value
    total_value = 0.0
    category_waste = {}
    for log in waste_logs:
        item = log.item
        if item:
            val = log.quantity_used * item.cost_per_unit
            total_value += val
            cat_name = item.category.name if item.category else "Other"
            category_waste[cat_name] = category_waste.get(cat_name, 0) + val

    # Total consumed in period
    all_logs = db.query(UsageLog).filter(UsageLog.used_date >= since).all()
    total_used = sum(l.quantity_used for l in all_logs)
    waste_score = (total_wasted / total_used * 100) if total_used > 0 else 0

    waste_by_cat = [{"category": k, "value": round(v, 2)} for k, v in sorted(category_waste.items(), key=lambda x: -x[1])]

    return WasteData(
        waste_score=round(min(waste_score, 100), 1),
        total_wasted_units=round(total_wasted, 1),
        total_wasted_value=round(total_value, 2),
        waste_by_category=waste_by_cat,
        period_days=days,
    )


def get_reorder_suggestions(db: Session) -> list[ReorderSuggestion]:
    items = db.query(InventoryItem).filter(InventoryItem.quantity > 0).all()
    suggestions = []
    for item in items:
        logs = (
            db.query(UsageLog)
            .filter(UsageLog.item_id == item.id, UsageLog.reason == "consumed")
            .order_by(UsageLog.used_date.desc())
            .limit(30)
            .all()
        )
        if not logs:
            continue
        # Calculate daily burn rate
        dates = [l.used_date for l in logs]
        if len(dates) < 2:
            continue
        span_days = max((max(dates) - min(dates)).total_seconds() / 86400, 1)
        total_consumed = sum(l.quantity_used for l in logs)
        daily_rate = total_consumed / span_days
        if daily_rate <= 0:
            continue
        days_left = item.quantity / daily_rate

        if days_left <= 1:
            urgency = "critical"
        elif days_left <= 3:
            urgency = "warning"
        else:
            urgency = "ok"

        suggestions.append(ReorderSuggestion(
            item_id=item.id,
            item_name=item.name,
            current_quantity=item.quantity,
            unit=item.unit,
            daily_burn_rate=round(daily_rate, 2),
            days_until_empty=round(days_left, 1),
            urgency=urgency,
        ))
    suggestions.sort(key=lambda s: s.days_until_empty)
    return suggestions


def get_sustainability_score(db: Session) -> SustainabilityScore:
    waste = get_waste_data(db, days=30)
    items = db.query(InventoryItem).filter(InventoryItem.quantity > 0).all()

    # Waste ratio component (lower is better)
    waste_ratio = waste.waste_score / 100  # 0 to 1
    waste_component = max(0, (1 - waste_ratio) * 50)  # 0-50 points

    # Expiry management component
    today = date.today()
    total_with_expiry = sum(1 for i in items if i.expiry_date)
    expired_count = sum(1 for i in items if i.expiry_date and i.expiry_date < today)
    if total_with_expiry > 0:
        expiry_ratio = 1 - (expired_count / total_with_expiry)
    else:
        expiry_ratio = 1.0
    expiry_component = expiry_ratio * 50  # 0-50 points

    score = round(waste_component + expiry_component, 1)

    if score >= 80:
        grade = "A"
    elif score >= 60:
        grade = "B"
    elif score >= 40:
        grade = "C"
    elif score >= 20:
        grade = "D"
    else:
        grade = "F"

    tips = []
    if waste_ratio > 0.2:
        tips.append("High waste detected. Consider ordering smaller quantities of perishables.")
    if expired_count > 0:
        tips.append(f"{expired_count} expired items still in stock. Clear them to improve your score.")
    if waste_ratio <= 0.05:
        tips.append("Excellent waste management! Keep up the great work.")
    if not tips:
        tips.append("Good job! Monitor expiry dates to maintain your score.")

    return SustainabilityScore(
        score=score,
        grade=grade,
        waste_ratio=round(waste_ratio * 100, 1),
        expiry_management=round(expiry_ratio * 100, 1),
        tips=tips,
    )
