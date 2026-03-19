from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime


# --- Category ---
class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str


# --- Inventory Item ---
class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category_id: Optional[int] = None
    quantity: float = Field(..., ge=0)
    unit: str = Field(default="units", max_length=50)
    cost_per_unit: float = Field(default=0.0, ge=0)
    expiry_date: Optional[date] = None
    notes: Optional[str] = ""


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category_id: Optional[int] = None
    category: Optional[CategoryOut] = None
    quantity: float
    unit: str
    cost_per_unit: float
    expiry_date: Optional[date] = None
    status: str
    added_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    notes: Optional[str] = ""


# --- Usage Log ---
class UsageCreate(BaseModel):
    item_id: int
    quantity_used: float = Field(..., gt=0)
    reason: str = Field(default="consumed")
    notes: Optional[str] = ""


class UsageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    quantity_used: float
    used_date: Optional[datetime] = None
    reason: str
    notes: Optional[str] = ""


# --- AI Parse ---
class AIParseRequest(BaseModel):
    text: str = Field(..., min_length=1)


class AIParseResponse(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[str] = None
    method: str = "fallback"


# --- Analytics ---
class DashboardStats(BaseModel):
    total_items: int = 0
    expiring_soon: int = 0
    expired_count: int = 0
    total_value: float = 0.0
    items_used_today: int = 0


class WasteData(BaseModel):
    waste_score: float = 0.0
    total_wasted_units: float = 0.0
    total_wasted_value: float = 0.0
    waste_by_category: list = []
    period_days: int = 30


class ReorderSuggestion(BaseModel):
    item_id: int
    item_name: str
    current_quantity: float
    unit: str
    daily_burn_rate: float
    days_until_empty: float
    urgency: str  # "critical", "warning", "ok"


class SustainabilityScore(BaseModel):
    score: float = 0.0  # 0-100
    grade: str = "A"
    waste_ratio: float = 0.0
    expiry_management: float = 0.0
    tips: list = []


# --- Image Classification ---
class ImageClassifyResponse(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    method: str = "vision"


# --- Recipes ---
class RecipeIngredient(BaseModel):
    name: str
    quantity: str
    is_expiring: bool = False


class Recipe(BaseModel):
    title: str
    description: str
    ingredients: list[RecipeIngredient]
    instructions: list[str]
    prep_time: Optional[str] = None
    servings: Optional[str] = None


class RecipesRequest(BaseModel):
    items: list[dict]


class RecipesResponse(BaseModel):
    recipes: list[Recipe]
    method: str = "ai"
