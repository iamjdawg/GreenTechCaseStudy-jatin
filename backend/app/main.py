from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import crud, schemas
from .routers import inventory, usage, analytics, ai
from .services.seed_service import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    crud.seed_categories(db)
    db.close()
    yield


app = FastAPI(
    title="Green-Tech Inventory Assistant",
    description="AI-powered inventory tracking for Bean & Leaf Cafe",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory.router)
app.include_router(usage.router)
app.include_router(analytics.router)
app.include_router(ai.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Bean & Leaf Cafe Inventory"}


@app.get("/api/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.post("/api/seed")
def seed(db: Session = Depends(get_db)):
    return seed_database(db)
