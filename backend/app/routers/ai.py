import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..schemas import AIParseRequest, AIParseResponse, ImageClassifyResponse, RecipesRequest, RecipesResponse
from ..services.ai_service import ai_parse, ai_classify_image, ai_generate_recipes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/parse", response_model=AIParseResponse)
async def parse_text(req: AIParseRequest):
    return await ai_parse(req.text)


@router.post("/classify-image", response_model=ImageClassifyResponse)
async def classify_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid image type: {file.content_type}. Allowed: JPEG, PNG, GIF, WebP")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Maximum size is 10MB")

    try:
        return await ai_classify_image(image_bytes, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@router.post("/recipes", response_model=RecipesResponse)
async def generate_recipes(req: RecipesRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="No items provided")

    try:
        return await ai_generate_recipes(req.items)
    except ValueError as e:
        if "API key" in str(e):
            raise HTTPException(status_code=503, detail=str(e))
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {str(e)}")
    except Exception as e:
        logger.exception("Recipe generation failed")
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {str(e)}")
