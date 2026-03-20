from fastapi import APIRouter

from app.db.convex_client import convex

router = APIRouter(prefix="/api/demo", tags=["demo-data"])


@router.get("/jobs")
def get_demo_jobs() -> list[dict]:
    return convex.query("career:listDemoJobs") or []


@router.get("/resumes")
def get_demo_resumes() -> list[dict]:
    return convex.query("career:listDemoResumes") or []
