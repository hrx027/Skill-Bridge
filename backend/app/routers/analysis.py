from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.db.convex_client import convex
from app.models.schemas import GapAnalysisOut, GapAnalysisRequest, InsightOut, InsightRequest, ResumeMatchOut
from app.services.skill_engine import compare_with_benchmark_resumes, compute_gap_analysis, generate_groq_insights

router = APIRouter(prefix="/api/analysis", tags=["analysis"])
settings = get_settings()


@router.post("/gap", response_model=GapAnalysisOut)
def run_gap_analysis(payload: GapAnalysisRequest) -> GapAnalysisOut:
    resume = convex.query("career:getResume", {"resume_id": payload.resume_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if payload.user_id != str(resume["user_id"]):
        raise HTTPException(status_code=400, detail="Resume does not belong to user")
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for AI gap analysis")

    user_skills = {skill["name"] for skill in resume["parsed_skills"]}
    try:
        computed = compute_gap_analysis(
            user_skills,
            payload.target_role,
            model=settings.groq_model,
            api_key=settings.groq_api_key,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="AI gap analysis failed")

    created_at = datetime.now(timezone.utc).isoformat()
    record = convex.mutation("career:createAnalysis", {
        "user_id": payload.user_id,
        "resume_id": payload.resume_id,
        "target_role": payload.target_role,
        **computed,
        "created_at": created_at,
    })
    return GapAnalysisOut(
        analysis_id=str(record["_id"]),
        target_role=record["target_role"],
        matched_skills=record["matched_skills"],
        missing_skills=record["missing_skills"],
        transferable_skills=record["transferable_skills"],
        coverage_score=record["coverage_score"],
        ai_used=record["ai_used"],
        fallback_used=record["fallback_used"],
    )


@router.get("/resume-match/{resume_id}", response_model=list[ResumeMatchOut])
def resume_match(resume_id: str) -> list[ResumeMatchOut]:
    resume = convex.query("career:getResume", {"resume_id": resume_id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    user_skills = {skill["name"] for skill in resume["parsed_skills"]}
    demo_resumes = convex.query("career:listDemoResumes") or []
    ranked = compare_with_benchmark_resumes(
        user_skills,
        demo_resumes,
        user_embedding=resume.get("embedding"),
        model=settings.groq_model,
        api_key=settings.groq_api_key,
    )
    return [ResumeMatchOut(**item) for item in ranked[:20]]


@router.post("/insights", response_model=InsightOut)
def user_insights(payload: InsightRequest) -> InsightOut:
    user = convex.query("users:getById", {"user_id": payload.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for AI insights generation")

    analysis = None
    if payload.analysis_id:
        analysis = convex.query("career:getAnalysis", {"analysis_id": payload.analysis_id})
    if not analysis:
        analysis = convex.query("career:getLatestAnalysisByUser", {"user_id": payload.user_id})

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    try:
        insights = generate_groq_insights(
            matched_skills=analysis["matched_skills"],
            missing_skills=analysis["missing_skills"],
            target_role=analysis["target_role"],
            model=settings.groq_model,
            api_key=settings.groq_api_key,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="AI insights generation failed")
    return InsightOut(**insights)
