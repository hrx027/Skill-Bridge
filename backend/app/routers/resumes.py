from datetime import datetime, timezone
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pypdf import PdfReader

from app.db.convex_client import convex
from app.models.schemas import ResumeCreate, ResumeOut
from app.config import get_settings
from app.services.skill_engine import embed_text, parse_resume_skills

router = APIRouter(prefix="/api/resumes", tags=["resumes"])
settings = get_settings()


@router.get("/user/{user_id}", response_model=list[ResumeOut])
def list_user_resumes(user_id: str) -> list[ResumeOut]:
    rows = convex.query("career:listResumesByUser", {"user_id": user_id}) or []
    return [
        ResumeOut(
            id=str(r["_id"]),
            user_id=str(r["user_id"]),
            title=r["title"],
            source=r["source"],
            raw_text=r["raw_text"],
            parsed_skills=r["parsed_skills"],
            created_at=r["created_at"],
        )
        for r in rows
    ]


def _extract_pdf_text(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    text_parts: list[str] = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts).strip()


@router.post("", response_model=ResumeOut)
def create_resume(payload: ResumeCreate) -> ResumeOut:
    user = convex.query("users:getById", {"user_id": payload.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for AI resume parsing")

    try:
        parsed_skills = parse_resume_skills(payload.raw_text, model=settings.groq_model, api_key=settings.groq_api_key)
    except Exception:
        raise HTTPException(status_code=502, detail="AI resume parsing failed")
    embedding = embed_text(payload.raw_text, model=settings.groq_model, api_key=settings.groq_api_key)
    now = datetime.now(timezone.utc).isoformat()
    created = convex.mutation(
        "career:createResume",
        {
            "user_id": payload.user_id,
            "title": payload.title,
            "source": payload.source,
            "raw_text": payload.raw_text,
            "parsed_skills": parsed_skills,
            "embedding": embedding,
            "created_at": now,
        },
    )

    return ResumeOut(
        id=str(created["_id"]),
        user_id=str(created["user_id"]),
        title=created["title"],
        source=created["source"],
        raw_text=created["raw_text"],
        parsed_skills=created["parsed_skills"],
        created_at=created.get("created_at", now),
    )


@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    user_id: str = Form(...),
    title: str = Form("Resume"),
    file: UploadFile = File(...),
) -> ResumeOut:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    user = convex.query("users:getById", {"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    content = await file.read()
    raw_text = _extract_pdf_text(content)
    if len(raw_text) < 30:
        raise HTTPException(status_code=400, detail="Could not extract sufficient text from PDF")
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is required for AI resume parsing")

    try:
        parsed_skills = parse_resume_skills(raw_text, model=settings.groq_model, api_key=settings.groq_api_key)
    except Exception:
        raise HTTPException(status_code=502, detail="AI resume parsing failed")
    embedding = embed_text(raw_text, model=settings.groq_model, api_key=settings.groq_api_key)
    now = datetime.now(timezone.utc).isoformat()
    created = convex.mutation(
        "career:createResume",
        {
            "user_id": user_id,
            "title": title,
            "source": "upload",
            "raw_text": raw_text,
            "parsed_skills": parsed_skills,
            "embedding": embedding,
            "created_at": now,
        },
    )

    return ResumeOut(
        id=str(created["_id"]),
        user_id=str(created["user_id"]),
        title=created["title"],
        source=created["source"],
        raw_text=created["raw_text"],
        parsed_skills=created["parsed_skills"],
        created_at=created.get("created_at", now),
    )
