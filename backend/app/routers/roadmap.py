from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.db.convex_client import convex
from app.models.schemas import RoadmapOut, RoadmapRequest
from app.services.skill_engine import generate_groq_roadmap

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])
settings = get_settings()


@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(payload: RoadmapRequest) -> RoadmapOut:
    analysis = convex.query("career:getAnalysis", {"analysis_id": payload.analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if str(analysis["user_id"]) != payload.user_id:
        raise HTTPException(status_code=400, detail="Analysis does not belong to user")
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for AI roadmap generation")

    try:
        items, ai_used = generate_groq_roadmap(
            analysis["missing_skills"],
            analysis["target_role"],
            model=settings.groq_model,
            api_key=settings.groq_api_key,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="AI roadmap generation failed")
    record = convex.mutation("career:createRoadmap", {
        "user_id": payload.user_id,
        "analysis_id": payload.analysis_id,
        "items": items,
        "ai_used": ai_used,
        "fallback_used": not ai_used,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return RoadmapOut(
        roadmap_id=str(record["_id"]),
        user_id=str(record["user_id"]),
        analysis_id=str(record["analysis_id"]),
        items=record["items"],
        ai_used=record["ai_used"],
        fallback_used=record["fallback_used"],
    )
