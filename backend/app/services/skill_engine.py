from __future__ import annotations

import hashlib
import html
import math
import re
import urllib.parse
from typing import Optional

import httpx


def normalize_text(value: str) -> str:
    return value.strip().lower()


_STOPWORDS = {
    "a",
    "about",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "can",
    "for",
    "from",
    "have",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "they",
    "this",
    "to",
    "was",
    "were",
    "with",
    "you",
    "your",
    "years",
    "year",
    "month",
    "months",
    "experience",
    "project",
    "projects",
    "responsible",
    "worked",
    "work",
    "skills",
    "summary",
    "objective",
    "education",
    "university",
    "college",
    "bachelor",
    "master",
    "degree",
    "certification",
    "certifications",
    "intern",
    "internship",
    "company",
    "role",
    "roles",
    "team",
    "tools",
}


def extract_resume_keywords(raw_text: str, max_keywords: int = 50) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9_\-+.\/#]{1,50}", raw_text.lower())
    counts: dict[str, int] = {}
    for token in tokens:
        if len(token) < 3:
            continue
        if token in _STOPWORDS:
            continue
        if token.startswith("http"):
            continue
        counts[token] = counts.get(token, 0) + 1

    ranked = sorted(counts.items(), key=lambda x: (-x[1], x[0]))
    return [t for t, _ in ranked[:max_keywords]]


def parse_resume_skills(raw_text: str, model: str, api_key: Optional[str]) -> list[dict]:
    if not raw_text.strip():
        return []

    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required for AI resume parsing")

    keywords = extract_resume_keywords(raw_text, max_keywords=60)
    excerpt = " ".join(raw_text.split())[:2500]
    try:
        prompt = (
            "Infer the candidate's known technical skills from the resume evidence. "
            "Return strict JSON array of objects with keys: name (string), confidence (number 0..1). "
            "Use short canonical names (e.g., 'python', 'react', 'kubernetes', 'typescript'). "
            "Exclude soft skills. Deduplicate. Keep 10-30 items. "
            f"Resume keywords: {keywords}. Resume excerpt: {excerpt}"
        )
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            },
            timeout=25.0,
        )
        response.raise_for_status()
        import json

        items = json.loads(response.json()["choices"][0]["message"]["content"])
        normalized: list[dict] = []
        seen: set[str] = set()
        for item in items[:40]:
            name = normalize_text(str(item.get("name", "")))
            if not name or name in _STOPWORDS:
                continue
            if len(name) > 60:
                continue
            if name in seen:
                continue
            seen.add(name)
            try:
                confidence = float(item.get("confidence", 0.7))
            except Exception:
                confidence = 0.7
            confidence = max(0.0, min(1.0, confidence))
            normalized.append({"name": name, "confidence": confidence})
        if not normalized:
            raise RuntimeError("AI returned no skills for this resume")
        return normalized
    except Exception:
        raise RuntimeError("AI resume parsing failed")


def _normalize_embedding(vec: list[float]) -> list[float]:
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def local_text_embedding(text: str, dim: int = 128) -> list[float]:
    vec = [0.0] * dim
    for token in re.findall(r"[a-zA-Z0-9_\-/+.]+", text.lower()):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        idx = int.from_bytes(digest[:4], "big") % dim
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        weight = 1.0 + (digest[5] / 255.0)
        vec[idx] += sign * weight
    return _normalize_embedding(vec)


def embed_text(text: str, model: str, api_key: Optional[str]) -> list[float]:
    if not text.strip():
        return local_text_embedding("empty")

    if not api_key:
        return local_text_embedding(text)

    try:
        response = httpx.post(
            "https://api.groq.com/openai/v1/embeddings",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": model, "input": text[:8000]},
            timeout=20.0,
        )
        response.raise_for_status()
        data = response.json()["data"][0]["embedding"]
        return _normalize_embedding([float(x) for x in data])
    except Exception:
        return local_text_embedding(text)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b:
        return 0.0
    n = min(len(a), len(b))
    return round(sum(a[i] * b[i] for i in range(n)), 4)


def _duckduckgo_search(query: str, max_results: int = 5) -> list[dict]:
    q = urllib.parse.quote_plus(query)
    url = f"https://duckduckgo.com/html/?q={q}"
    try:
        resp = httpx.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html,application/xhtml+xml",
            },
            timeout=15.0,
            follow_redirects=True,
        )
        resp.raise_for_status()
        body = resp.text

        link_re = re.compile(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', re.IGNORECASE)
        snippet_re = re.compile(r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>', re.IGNORECASE)

        links = link_re.findall(body)
        snippets = snippet_re.findall(body)

        results: list[dict] = []
        for i in range(min(len(links), max_results)):
            href, title = links[i]
            snippet = snippets[i] if i < len(snippets) else ""
            results.append(
                {
                    "title": html.unescape(re.sub(r"<[^>]+>", "", title)).strip(),
                    "url": html.unescape(href).strip(),
                    "snippet": html.unescape(re.sub(r"<[^>]+>", "", snippet)).strip(),
                }
            )
        return results
    except Exception:
        return []


def _infer_role_skills_from_web(
    target_role: str,
    web_results: list[dict],
    model: str,
    api_key: str,
) -> list[str]:
    context = "\n".join(
        f"- {r.get('title','')}: {r.get('snippet','')} ({r.get('url','')})" for r in (web_results or [])
    )[:6000]
    try:
        prompt = (
            "You are analyzing role requirements using web search snippets. "
            "Return strict JSON object with key required_skills: array of 20-35 technical skills/competencies. "
            "Use lowercase canonical names. Exclude soft skills. Deduplicate. "
            f"Target role: {target_role}. Web snippets:\n{context}"
        )
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            },
            timeout=25.0,
        )
        response.raise_for_status()
        import json

        parsed = json.loads(response.json()["choices"][0]["message"]["content"])
        skills = parsed.get("required_skills", [])
        normalized: list[str] = []
        seen: set[str] = set()
        for s in skills[:60]:
            name = normalize_text(str(s))
            if not name or name in _STOPWORDS:
                continue
            if len(name) > 60:
                continue
            if name in seen:
                continue
            seen.add(name)
            normalized.append(name)
        return normalized
    except Exception:
        return []


def _infer_transferable_skills(
    user_skills: set[str],
    matched_skills: set[str],
    target_role: str,
    model: str,
    api_key: str,
) -> list[str]:
    try:
        prompt = (
            "Return strict JSON object with key transferable_skills: array of up to 8 items. "
            "These are skills the candidate already has that strongly transfer to the target role, "
            "even if not direct must-have skills. Use lowercase canonical names. "
            f"Target role: {target_role}. Candidate skills: {sorted(user_skills)}. "
            f"Already matched skills: {sorted(matched_skills)}."
        )
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            },
            timeout=20.0,
        )
        response.raise_for_status()
        import json

        parsed = json.loads(response.json()["choices"][0]["message"]["content"])
        skills = parsed.get("transferable_skills", [])
        normalized: list[str] = []
        seen: set[str] = set()
        for s in skills[:20]:
            name = normalize_text(str(s))
            if not name or name in _STOPWORDS:
                continue
            if len(name) > 60:
                continue
            if name in seen:
                continue
            seen.add(name)
            normalized.append(name)
        return normalized
    except Exception:
        return []


def compute_gap_analysis(
    user_skills: set[str],
    target_role: str,
    model: str,
    api_key: Optional[str],
) -> dict:
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required for AI gap analysis")

    web_results = _duckduckgo_search(f"{target_role} required skills", max_results=6)
    web_results += _duckduckgo_search(f"{target_role} job description key skills", max_results=6)
    web_results = web_results[:8]

    role_skills = set(_infer_role_skills_from_web(target_role, web_results, model=model, api_key=api_key))
    if not role_skills:
        raise RuntimeError("AI could not infer required skills for this role")

    matched = sorted(user_skills & role_skills)
    missing = sorted(role_skills - user_skills)
    transferable = _infer_transferable_skills(
        user_skills=user_skills,
        matched_skills=set(matched),
        target_role=target_role,
        model=model,
        api_key=api_key,
    )
    coverage = round((len(matched) / len(role_skills)) * 100, 2) if role_skills else 0.0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "transferable_skills": transferable,
        "coverage_score": coverage,
        "ai_used": True,
        "fallback_used": False,
    }


def generate_groq_roadmap(
    missing_skills: list[str],
    target_role: str,
    model: str,
    api_key: Optional[str],
) -> tuple[list[dict], bool]:
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required for AI roadmap generation")
    try:
        prompt = (
            "Return strict JSON array of roadmap items with keys: title, provider, duration, cost_type, milestone. "
            "milestone must be one of quick_wins, core_skills, advanced_projects. "
            f"Target role: {target_role}. Missing skills: {missing_skills}. Keep 6-8 items."
        )
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            },
            timeout=20.0,
        )
        response.raise_for_status()
        import json

        items = json.loads(response.json()["choices"][0]["message"]["content"])
        normalized = []
        for item in items[:8]:
            normalized.append(
                {
                    "title": item.get("title", "Learning Task"),
                    "provider": item.get("provider", "Curated Resource"),
                    "duration": item.get("duration", "4 hours"),
                    "cost_type": item.get("cost_type", "free"),
                    "milestone": item.get("milestone", "core_skills"),
                }
            )
        if not normalized:
            raise RuntimeError("AI returned an empty roadmap")
        return normalized, True
    except Exception:
        raise RuntimeError("AI roadmap generation failed")


def generate_groq_interview_questions(
    missing_skills: list[str],
    target_role: str,
    model: str,
    api_key: Optional[str],
) -> tuple[list[dict], bool]:
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required for AI interview question generation")
    try:
        prompt = (
            "Return strict JSON array of 10 interview questions with keys: skill, level, question, expected_concepts. "
            "level must be beginner/intermediate/advanced. "
            f"Target role: {target_role}. Focus on missing skills and closely related fields: {missing_skills}."
        )
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "Return JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
            },
            timeout=20.0,
        )
        response.raise_for_status()
        import json

        questions = json.loads(response.json()["choices"][0]["message"]["content"])
        normalized = []
        for q in questions[:15]:
            normalized.append(
                {
                    "skill": q.get("skill", "system design"),
                    "level": q.get("level", "intermediate"),
                    "question": q.get("question", "Explain your approach to solving this problem."),
                    "expected_concepts": q.get("expected_concepts", ["fundamentals", "trade-offs"]),
                }
            )
        if not normalized:
            raise RuntimeError("AI returned empty interview questions")
        return normalized, True
    except Exception:
        raise RuntimeError("AI interview question generation failed")


def compare_with_benchmark_resumes(
    user_skills: set[str],
    demo_resumes: list[dict],
    user_embedding: Optional[list[float]] = None,
    model: str = "openai/gpt-oss-120b",
    api_key: Optional[str] = None,
) -> list[dict]:
    ranked: list[dict] = []
    for resume in demo_resumes:
        benchmark_skills = set(resume.get("skills", []))
        matched = sorted(user_skills & benchmark_skills)
        missing = sorted(benchmark_skills - user_skills)
        overlap_score = round((len(matched) / max(len(benchmark_skills), 1)) * 100, 2)
        benchmark_text = " ".join(sorted(benchmark_skills))
        benchmark_embedding = embed_text(benchmark_text, model=model, api_key=api_key)
        semantic = cosine_similarity(user_embedding or [], benchmark_embedding)
        semantic_score = max(0.0, semantic) * 100
        score = round((0.6 * overlap_score) + (0.4 * semantic_score), 2)
        ranked.append(
            {
                "benchmark_resume_id": resume["demo_resume_id"],
                "benchmark_role": resume["benchmark_role"],
                "benchmark_level": resume["benchmark_level"],
                "match_score": score,
                "semantic_score": round(semantic_score, 2),
                "matched_skills": matched,
                "missing_skills": missing,
            }
        )

    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked


def generate_groq_insights(
    matched_skills: list[str],
    missing_skills: list[str],
    target_role: str,
    model: str,
    api_key: Optional[str],
) -> dict:
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required for AI insights generation")

    try:
        prompt = (
            "You are a career mentor AI. Based on role readiness, return strict JSON with keys: "
            "summary (string), strengths (array), focus_areas (array), next_30_days (array). "
            f"Target role: {target_role}. Matched skills: {matched_skills}. Missing skills: {missing_skills}."
        )
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a concise JSON-only assistant."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
            },
            timeout=20.0,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        import json

        parsed = json.loads(content)
        return {
            "summary": parsed.get("summary", "Insights generated."),
            "strengths": parsed.get("strengths", []),
            "focus_areas": parsed.get("focus_areas", []),
            "next_30_days": parsed.get("next_30_days", []),
            "ai_used": True,
            "fallback_used": False,
        }
    except Exception:
        raise RuntimeError("AI insights generation failed")
