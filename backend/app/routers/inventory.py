from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("", response_model=list[schemas.ItemOut])
def list_items(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    sort_by: str = "expiry_date",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud.get_items(db, search=search, category_id=category_id, status=status, sort_by=sort_by, skip=skip, limit=limit)


@router.post("", response_model=schemas.ItemOut, status_code=201)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(
        db,
        name=item.name,
        category_id=item.category_id,
        quantity=item.quantity,
        unit=item.unit,
        cost_per_unit=item.cost_per_unit,
        expiry_date=item.expiry_date,
        notes=item.notes or "",
    )


@router.get("/expiring", response_model=list[schemas.ItemOut])
def expiring_items(days: int = Query(default=7, ge=1, le=90), db: Session = Depends(get_db)):
    return crud.get_expiring_items(db, days=days)


@router.get("/{item_id}", response_model=schemas.ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=schemas.ItemOut)
def update_item(item_id: int, data: schemas.ItemUpdate, db: Session = Depends(get_db)):
    updates = data.model_dump(exclude_unset=True)
    item = crud.update_item(db, item_id, **updates)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    if not crud.delete_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"detail": "Item deleted"}
