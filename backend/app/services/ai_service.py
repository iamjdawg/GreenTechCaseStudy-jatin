import base64
import json
import re
from datetime import datetime, date
from typing import Optional

import httpx
from openai import OpenAI

from ..config import settings
from ..schemas import AIParseResponse, ImageClassifyResponse, RecipesResponse


def _get_openai_client(timeout: int = None) -> OpenAI:
    """Create OpenAI-compatible client pointing to configured API (Gemini/OpenAI)."""
    t = timeout or settings.openai_timeout
    http_client = httpx.Client(verify=False, timeout=t)
    return OpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        http_client=http_client,
    )

# Category keyword mapping for fallback parser
CATEGORY_KEYWORDS = {
    "Dairy": ["milk", "cheese", "cream", "butter", "yogurt", "yoghurt", "whey"],
    "Produce": ["lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "spinach", "avocado", "lemon", "lime", "herb", "basil", "mint", "cilantro", "parsley", "apple", "banana", "berry", "fruit", "vegetable", "salad", "cucumber", "celery", "kale"],
    "Meat": ["chicken", "beef", "pork", "turkey", "salmon", "fish", "bacon", "sausage", "ham", "tuna", "shrimp", "meat"],
    "Bakery": ["bread", "croissant", "muffin", "cake", "pastry", "scone", "bagel", "roll", "baguette", "sourdough", "cookie"],
    "Beverages": ["juice", "water", "soda", "tea", "lemonade", "smoothie", "drink", "kombucha"],
    "Coffee": ["coffee", "espresso", "arabica", "robusta", "latte", "cappuccino", "bean"],
    "Condiments": ["sauce", "ketchup", "mustard", "mayo", "mayonnaise", "dressing", "vinegar", "oil", "syrup", "honey", "jam", "salt", "pepper", "spice"],
    "Dry Goods": ["flour", "sugar", "rice", "pasta", "oat", "granola", "cereal", "nut", "almond", "walnut", "chocolate", "chip"],
    "Frozen": ["frozen", "ice cream", "gelato", "sorbet"],
}

UNIT_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|oz|liters?|litres?|l|ml|gallons?|gal|bags?|boxes?|packs?|packets?|cans?|bottles?|jars?|cartons?|dozen|dz|units?|pieces?|pcs|bunches?|loaves|loaf|cups?|tubs?|rolls?|slices?|bars?|sheets?)\b",
    re.IGNORECASE,
)

DATE_PATTERN = re.compile(
    r"(?:expires?|expiry|exp|best before|use by|bb)\s*:?\s*(.+?)(?:\s*$|\s*,|\s*\.)",
    re.IGNORECASE,
)


def _parse_date(text: str) -> Optional[str]:
    """Try to parse a date from various formats."""
    text = text.strip().rstrip(".,;")
    formats = [
        "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y",
        "%B %d", "%B %d %Y", "%b %d", "%b %d %Y",
        "%d %B", "%d %B %Y", "%d %b", "%d %b %Y",
        "%B %d, %Y", "%b %d, %Y",
    ]
    for fmt in formats:
        try:
            parsed = datetime.strptime(text, fmt)
            if parsed.year == 1900:
                parsed = parsed.replace(year=date.today().year)
                if parsed.date() < date.today():
                    parsed = parsed.replace(year=date.today().year + 1)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def _guess_category(text: str) -> Optional[str]:
    """Match text against category keywords."""
    lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return category
    return None


def fallback_parse(text: str) -> AIParseResponse:
    """Regex/keyword-based parser that works without any API key."""
    result = AIParseResponse(method="fallback")

    # Extract quantity + unit
    unit_match = UNIT_PATTERN.search(text)
    if unit_match:
        result.quantity = float(unit_match.group(1))
        result.unit = unit_match.group(2).lower().rstrip("s") if unit_match.group(2).lower() not in ("bags", "boxes", "packs", "packets", "cans", "bottles", "jars", "cartons", "loaves", "bunches", "rolls", "slices", "bars", "sheets", "pieces", "cups", "tubs") else unit_match.group(2).lower()

    # Extract expiry date
    date_match = DATE_PATTERN.search(text)
    if date_match:
        result.expiry_date = _parse_date(date_match.group(1))

    # Guess category
    result.category = _guess_category(text)

    # Extract name: remove quantity/unit chunk and date chunk, take what's left
    name_text = text
    if unit_match:
        name_text = name_text[:unit_match.start()] + name_text[unit_match.end():]
    if date_match:
        name_text = DATE_PATTERN.sub("", name_text)
    # Clean up: remove extra commas, "of", leading/trailing whitespace
    name_text = re.sub(r"\b(of|the|a|an)\b", " ", name_text, flags=re.IGNORECASE)
    name_text = re.sub(r"[,.\-;:]+", " ", name_text)
    name_text = re.sub(r"\s+", " ", name_text).strip()
    if name_text:
        result.name = name_text.title()

    return result


async def ai_parse(text: str) -> AIParseResponse:
    """Try OpenAI first, fall back to regex parser."""
    if not settings.openai_api_key:
        return fallback_parse(text)

    try:
        client = _get_openai_client(settings.openai_timeout)
        response = client.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a cafe inventory parser. Extract structured data from the user's input. "
                        "Return ONLY valid JSON with these fields: "
                        '{"name": "item name", "quantity": number, "unit": "unit", "category": "one of: Dairy, Produce, Meat, Bakery, Beverages, Coffee, Condiments, Dry Goods, Frozen, Other", "expiry_date": "YYYY-MM-DD or null"}. '
                        "If you cannot determine a field, set it to null."
                    ),
                },
                {"role": "user", "content": text},
            ],
            temperature=0,
            max_tokens=200,
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        return AIParseResponse(
            name=data.get("name"),
            quantity=data.get("quantity"),
            unit=data.get("unit"),
            category=data.get("category"),
            expiry_date=data.get("expiry_date"),
            method="ai",
        )
    except Exception:
        return fallback_parse(text)


async def ai_classify_image(image_bytes: bytes, content_type: str) -> ImageClassifyResponse:
    """Classify a product image using GPT-4o vision."""
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key is required for image classification")

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    media_type = content_type or "image/jpeg"

    client = _get_openai_client(settings.openai_vision_timeout)
    response = client.chat.completions.create(
        model=settings.openai_vision_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a cafe inventory classifier. Analyze the product photo and return ONLY valid JSON: "
                    '{"name": "product name", "category": "one of: Dairy, Produce, Meat, Bakery, Beverages, Coffee, Condiments, Dry Goods, Frozen, Other", '
                    '"unit": "appropriate unit (bottles, cans, bags, kg, liters, units, etc.)", "description": "brief product description"}. '
                    "If you cannot determine a field, set it to null."
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Classify this product for cafe inventory:"},
                    {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
                ],
            },
        ],
        temperature=0,
        max_tokens=300,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    data = json.loads(raw)

    return ImageClassifyResponse(
        name=data.get("name"),
        category=data.get("category"),
        unit=data.get("unit"),
        description=data.get("description"),
        method="vision",
    )


async def ai_generate_recipes(expiring_items: list[dict]) -> RecipesResponse:
    """Generate recipes from expiring items using GPT-4o-mini."""
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key is required for recipe generation")

    items_text = ", ".join(
        f"{item.get('quantity', '?')} {item.get('unit', '')} {item.get('name', 'unknown')}"
        for item in expiring_items
    )
    item_names = [item.get("name", "").lower() for item in expiring_items]

    client = _get_openai_client(settings.openai_timeout + 12)
    response = client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a creative cafe chef. Generate exactly 3 recipes that use the expiring ingredients provided. "
                    "Return ONLY valid JSON: {\"recipes\": [{\"title\": \"...\", \"description\": \"...\", "
                    "\"ingredients\": [{\"name\": \"...\", \"quantity\": \"...\", \"is_expiring\": true/false}], "
                    "\"instructions\": [\"step 1\", \"step 2\", ...], \"prep_time\": \"...\", \"servings\": \"...\"}]}. "
                    "Mark ingredients from the expiring list with is_expiring: true. You may add common pantry ingredients with is_expiring: false."
                ),
            },
            {
                "role": "user",
                "content": f"Expiring ingredients: {items_text}",
            },
        ],
        temperature=0.7,
        max_tokens=4096,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*\n?", "", raw)
    raw = re.sub(r"\n?\s*```$", "", raw)
    raw = raw.strip()
    data = json.loads(raw)

    return RecipesResponse(recipes=data.get("recipes", []), method="ai")
