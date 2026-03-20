import json
import random
from pathlib import Path


ROLES = ["Cloud Engineer", "DevOps Engineer", "Data Engineer", "Backend Engineer", "Fullstack Engineer"]
LEVELS = ["junior", "mid", "senior"]

SKILL_POOL = {
    "Cloud Engineer": ["aws", "kubernetes", "terraform", "docker", "linux", "monitoring", "ci/cd", "python"],
    "DevOps Engineer": ["docker", "kubernetes", "terraform", "github actions", "ci/cd", "observability", "linux"],
    "Data Engineer": ["python", "sql", "spark", "airflow", "etl", "aws"],
    "Backend Engineer": ["python", "sql", "docker", "ci/cd", "linux", "monitoring"],
    "Fullstack Engineer": ["javascript", "react", "node", "python", "sql", "docker"],
}


def generate_resume(idx: int) -> dict:
    role = random.choice(ROLES)
    level = random.choice(LEVELS)
    base = SKILL_POOL[role]
    k = random.randint(max(4, len(base) // 2), min(len(base), len(base)))
    skills = sorted(random.sample(base, k=k))
    return {
        "demo_resume_id": f"demo_resume_{idx:03d}",
        "benchmark_role": role,
        "benchmark_level": level,
        "skills": skills,
    }


def main() -> None:
    random.seed(42)
    resumes = [generate_resume(i) for i in range(1, 121)]
    output_dir = Path(__file__).resolve().parents[1] / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "top_resumes.json"
    output_file.write_text(json.dumps(resumes, indent=2))
    print(f"Seeded {len(resumes)} resumes -> {output_file}")


if __name__ == "__main__":
    main()
