from __future__ import annotations

import json
from pathlib import Path


def demo_jobs_seed() -> list[dict]:
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


def demo_resumes_seed() -> list[dict]:
    data_file = Path(__file__).resolve().parents[2] / "data" / "top_resumes.json"
    if data_file.exists():
        try:
            data = json.loads(data_file.read_text())
            if isinstance(data, list):
                normalized: list[dict] = []
                for i, row in enumerate(data):
                    normalized.append(
                        {
                            "demo_resume_id": row.get("demo_resume_id") or f"seed_resume_{i+1}",
                            "benchmark_role": row.get("benchmark_role") or row.get("role") or "Cloud Engineer",
                            "benchmark_level": row.get("benchmark_level") or row.get("level") or "junior",
                            "skills": row.get("skills") or [],
                        }
                    )
                if normalized:
                    return normalized
        except Exception:
            pass

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
