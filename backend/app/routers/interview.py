from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.db.convex_client import convex
from app.models.schemas import InterviewRequest, InterviewSetOut
from app.services.skill_engine import generate_groq_interview_questions

router = APIRouter(prefix="/api/interview", tags=["interview"])
settings = get_settings()


@router.post("/questions", response_model=InterviewSetOut)
def generate_questions(payload: InterviewRequest) -> InterviewSetOut:
    analysis = convex.query("career:getAnalysis", {"analysis_id": payload.analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if str(analysis["user_id"]) != payload.user_id:
        raise HTTPException(status_code=400, detail="Analysis does not belong to user")
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for AI interview question generation")

    try:
        questions, ai_used = generate_groq_interview_questions(
            analysis["missing_skills"],
            analysis["target_role"],
            model=settings.groq_model,
            api_key=settings.groq_api_key,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="AI interview question generation failed")
    record = convex.mutation("career:createInterviewSet", {
        "analysis_id": payload.analysis_id,
        "user_id": payload.user_id,
        "questions": questions,
        "source": "ai" if ai_used else "rules",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return InterviewSetOut(
        set_id=str(record["_id"]),
        analysis_id=str(record["analysis_id"]),
        user_id=str(record["user_id"]),
        questions=record["questions"],
        source=record["source"],
    )
