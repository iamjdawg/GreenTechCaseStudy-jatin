from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/usage", tags=["usage"])


@router.post("", response_model=schemas.UsageOut, status_code=201)
def log_usage(usage: schemas.UsageCreate, db: Session = Depends(get_db)):
    log = crud.create_usage(
        db,
        item_id=usage.item_id,
        quantity_used=usage.quantity_used,
        reason=usage.reason,
        notes=usage.notes or "",
    )
    if not log:
        raise HTTPException(status_code=404, detail="Item not found")
    return log


@router.get("/{item_id}", response_model=list[schemas.UsageOut])
def get_usage_history(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.get_usage_logs(db, item_id)
