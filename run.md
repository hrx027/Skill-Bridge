Use these exact commands 👇

```bash
# 0) Kill stale backend process (IMPORTANT)
lsof -nP -iTCP:71 -sTCP:LISTEN
kill -9 <PID_FROM_ABOVE>
```

```bash
# 1) Backend (Terminal 1) - run on port 71
cd /Users/arihant/Desktop/dev/hrx/backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 71
```

```bash
# 2) Frontend (Terminal 2) - talks to backend :71
cd /Users/arihant/Desktop/dev/hrx/frontend
npm install
npm run dev -- --port 3000
```

```bash
# 3) Verify backend routes (Terminal 3)
curl -sS http://127.0.0.1:71/openapi.json | jq -r '.paths | keys[]' | grep '^/api/users'

# Expected output includes:
# /api/users
# /api/users/signin
# /api/users/{user_id}
```

```bash
# 4) Verify signup/signin APIs (Terminal 3)
curl -sS -i -X POST http://127.0.0.1:71/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Run Check","email":"run_check_user@example.com","phone_number":"9999999999","dob":"2000-01-01","password":"secret123","role":"student","target_role":"Cloud Engineer","experience_years":1,"github_url":null,"linkedin_url":null,"education_profile":{"degree":null,"institution":null,"branch":null,"graduation_year":null},"coding_profiles":{"github":null,"leetcode":null,"codeforces":null,"hackerrank":null},"bio":null}'

curl -sS -i -X POST http://127.0.0.1:71/api/users/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"run_check_user@example.com","password":"secret123"}'
```

```bash
# 5) Verify Convex tables have data (Terminal 3)
cd /Users/arihant/Desktop/dev/hrx/backend
npx convex data users
npx convex data sessions
```

If port 71 or 3000 is busy:

```bash
lsof -nP -iTCP:71 -sTCP:LISTEN
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill -9 <PID>
```