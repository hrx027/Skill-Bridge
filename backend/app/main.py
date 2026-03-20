from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db.convex_client import convex
from app.db.demo_seed import demo_jobs_seed, demo_resumes_seed
from app.routers.analysis import router as analysis_router
from app.routers.demo import router as demo_router
from app.routers.interview import router as interview_router
from app.routers.resumes import router as resumes_router
from app.routers.roadmap import router as roadmap_router
from app.routers.users import router as users_router

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def ensure_demo_seed_data() -> None:
    try:
        convex.mutation(
            "career:seedDemoData",
            {
                "jobs": demo_jobs_seed(),
                "resumes": demo_resumes_seed(),
            },
        )
    except Exception:
        # Keep API booting even if Convex seed fails during local startup.
        pass


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


@app.get("/api/convex/schema")
def convex_schema_blueprint() -> dict:
    return {
        "tables": {
            "users": {
                "fields": [
                    "authProviderId",
                    "email",
                    "name",
                    "role",
                    "targetRole",
                    "experienceYears",
                    "githubUrl",
                    "linkedinUrl",
                    "createdAt",
                    "updatedAt",
                ],
                "indexes": ["by_authProviderId", "by_email", "by_targetRole"],
            },
            "resumes": {
                "fields": [
                    "userId",
                    "type",
                    "title",
                    "source",
                    "fileUrl",
                    "rawText",
                    "parsedData",
                    "isActive",
                    "createdAt",
                    "updatedAt",
                ],
                "indexes": ["by_userId", "by_userId_isActive", "by_type"],
            },
            "user_resume_snapshots": {
                "fields": ["userId", "resumeId", "skills", "domains", "readinessScore", "targetRole", "createdAt"],
                "indexes": ["by_userId", "by_resumeId", "by_userId_createdAt"],
            },
            "demo_jobs": {
                "fields": [
                    "jobId",
                    "title",
                    "company",
                    "industry",
                    "location",
                    "description",
                    "requirements",
                    "preferredSkills",
                    "skillsRequired",
                    "seniority",
                    "source",
                    "createdAt",
                ],
                "indexes": ["by_jobId", "by_title", "by_industry"],
            },
            "demo_resumes": {
                "fields": ["benchmarkRole", "benchmarkLevel", "rawText", "parsedData", "skills", "createdAt"],
                "indexes": ["by_benchmarkRole", "by_benchmarkLevel"],
            },
            "gap_analyses": {
                "fields": [
                    "userId",
                    "resumeId",
                    "targetRole",
                    "matchedSkills",
                    "missingSkills",
                    "transferableSkills",
                    "coverageScore",
                    "aiUsed",
                    "fallbackUsed",
                    "createdAt",
                ],
                "indexes": ["by_userId", "by_resumeId", "by_targetRole", "by_userId_createdAt"],
            },
            "learning_roadmaps": {
                "fields": ["analysisId", "userId", "items", "status", "aiUsed", "fallbackUsed", "createdAt"],
                "indexes": ["by_analysisId", "by_userId"],
            },
            "interview_question_sets": {
                "fields": ["analysisId", "userId", "questions", "source", "createdAt"],
                "indexes": ["by_analysisId", "by_userId"],
            },
        }
    }


app.include_router(users_router)
app.include_router(resumes_router)
app.include_router(analysis_router)
app.include_router(roadmap_router)
app.include_router(interview_router)
app.include_router(demo_router)
