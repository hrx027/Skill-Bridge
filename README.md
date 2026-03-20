
# Skill-Bridge

Candidate Name: Hrithik Raj

Scenario Chosen: Skill-Bridge Career Navigator

Estimated Time Spent: 3hours

Working Demo-video Link: https://youtu.be/aIpe-mBii28



## Quick Start

Upload a resume, pick a target role, and get an AI-generated gap analysis (matched vs missing skills), plus an AI roadmap, interview questions, and career insights.

### Prerequisites

- Node.js (for the Next.js frontend and Convex CLI)
- Python 3.10+ (for the FastAPI backend)
- A Groq API key (required: resume parsing + gap analysis + roadmap + insights + interview questions are AI-only)

### Run Commands

Backend (FastAPI, port 71):

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 71
```

Frontend (Next.js, port 3000):

```bash
cd frontend
npm install
npm run dev
```

### Test Commands

Backend (syntax/compile):

```bash
python3 -m compileall backend/app
```

Frontend (typecheck + lint):

```bash
cd frontend
npx tsc --noEmit
npm run lint
```

## Environment Variables

Backend reads env vars via Pydantic settings: [config.py](backend/app/config.py).

- `GROQ_API_KEY` (required)
- `GROQ_MODEL` (optional; defaults to `openai/gpt-oss-120b`)
- `CONVEX_DEPLOYMENT_URL` (required to read/write data)
- `CONVEX_ADMIN_KEY` (optional; required for protected deployments)
- `FRONTEND_ORIGIN` (optional; CORS)

Frontend uses:

- `NEXT_PUBLIC_API_BASE_URL` (default in [frontend/.env](frontend/.env))

## Tech Stack

- Frontend: Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS, Radix UI
- Backend: FastAPI, Pydantic, Uvicorn, httpx, pypdf
- Storage: Convex (via HTTP API) [convex_client.py](backend/app/db/convex_client.py)
- AI: Groq-compatible OpenAI API endpoints (chat + embeddings)

## Dependencies

Backend: [requirements.txt](backend/requirements.txt)

Frontend: [frontend/package.json](frontend/package.json)

## Architecture Overview

- Resume upload extracts PDF text and stores:
  - `raw_text`
  - `parsed_skills` (AI-inferred from resume evidence; not hardcoded)
  - `embedding` (AI embedding with local fallback if key is missing, but main pipeline requires AI)
- Gap analysis:
  - Uses web search snippets for the target role
  - AI infers required role skills from those snippets
  - Backend computes matched vs missing vs transferable based on inferred sets
- Roadmap / Interview / Insights:
  - Generated from AI using the gap analysis results
  - No hardcoded role/skill lists for the core flow





- Prerequisites:
  - Node.js
  - Python 3.10+
  - Groq API key
- Run Commands:
  - Backend: `cd backend && python3 -m pip install -r requirements.txt && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 71`
  - Frontend: `cd frontend && npm install && npm run dev`
- Test Commands:
  - `python3 -m compileall backend/app`
  - `cd frontend && npx tsc --noEmit && npm run lint`

AI Disclosure:

- Did you use an AI assistant (Copilot, ChatGPT, etc.)? Yes
- How did you verify the suggestions?
  - Ran backend compile checks (`python3 -m compileall backend/app`)
  - Ran frontend lint + typecheck (`npm run lint`, `npx tsc --noEmit`)
  - Started the Next.js dev server successfully
- Give one example of a suggestion you rejected or changed:
  - Removed non-AI fallbacks (hardcoded skills/roles/roadmap/questions/insights) to ensure AI-only generation.

Tradeoffs & Prioritization:

- What did you cut to stay within the 4–6 hour limit?
  - Automated test suite additions (there are no dedicated unit/integration tests yet).
  - Full production hardening of web search and rate limiting.
- What would you build next if you had more time?
  - Deterministic “role requirements” caching and refresh strategy for web-sourced role skills.
  - Better skill normalization (synonyms, taxonomy, deduping across tool names/versions).
  - A richer roadmap format with links, projects, and measurable milestones.
  - Add backend tests (pytest) + frontend tests (Playwright/Vitest) and CI.
- Known limitations:
  - The core AI endpoints require `GROQ_API_KEY` and return 503 if missing.
  - Web search uses simple HTML scraping; a dedicated search API would be more reliable.
  - Secrets should not be committed; move keys to local-only env files and CI secrets.

