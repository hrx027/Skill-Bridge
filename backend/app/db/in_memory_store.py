from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from uuid import uuid4


class InMemoryStore:
    def __init__(self) -> None:
        self.users: dict[str, dict] = {}
        self.resumes: dict[str, dict] = {}
        self.analyses: dict[str, dict] = {}
        self.roadmaps: dict[str, dict] = {}
        self.interview_sets: dict[str, dict] = {}
        self.sessions: dict[str, str] = {}
        self.demo_jobs: list[dict] = self._seed_demo_jobs()
        self.demo_resumes: list[dict] = self._load_seeded_resumes() or self._seed_demo_resumes()

    @staticmethod
    def now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def new_id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex[:12]}"

    @staticmethod
    def _seed_demo_jobs() -> list[dict]:
        return [
            {
                "job_id": "job_cloud_001",
                "title": "Cloud Engineer",
                "company": "Nimbus Systems",
                "skills_required": [
                    "aws",
                    "kubernetes",
                    "terraform",
                    "docker",
                    "ci/cd",
                    "linux",
                    "python",
                    "monitoring",
                ],
            },
            {
                "job_id": "job_cloud_002",
                "title": "Junior DevOps Engineer",
                "company": "OrbitOps",
                "skills_required": [
                    "docker",
                    "github actions",
                    "terraform",
                    "aws",
                    "shell scripting",
                    "observability",
                ],
            },
            {
                "job_id": "job_data_001",
                "title": "Data Engineer",
                "company": "Data Forge",
                "skills_required": ["python", "sql", "spark", "airflow", "aws", "etl"],
            },
        ]

    @staticmethod
    def _seed_demo_resumes() -> list[dict]:
        return [
            {
                "demo_resume_id": "demo_resume_cloud_junior",
                "benchmark_role": "Cloud Engineer",
                "benchmark_level": "junior",
                "skills": ["linux", "docker", "aws", "python", "git", "ci/cd"],
            },
            {
                "demo_resume_id": "demo_resume_cloud_mid",
                "benchmark_role": "Cloud Engineer",
                "benchmark_level": "mid",
                "skills": ["linux", "docker", "aws", "terraform", "kubernetes", "monitoring"],
            },
        ]

    @staticmethod
    def _load_seeded_resumes() -> list[dict]:
        data_file = Path(__file__).resolve().parents[2] / "data" / "top_resumes.json"
        if not data_file.exists():
            return []
        try:
            data = json.loads(data_file.read_text())
            if isinstance(data, list):
                return data
        except Exception:
            return []
        return []


store = InMemoryStore()
