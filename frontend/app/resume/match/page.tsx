"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"
import { apiFetch } from "@/lib/api"

type MatchItem = {
  benchmark_resume_id: string
  benchmark_role: string
  benchmark_level: string
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
}

export default function ResumeMatchPage() {
  const user = getCurrentUser()
  const [resumeId, setResumeId] = useState(typeof window !== "undefined" ? localStorage.getItem("sb_resume_id") || "" : "")
  const [targetRole, setTargetRole] = useState(user?.target_role || "Cloud Engineer")
  const [analysis, setAnalysis] = useState<any>(null)
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [error, setError] = useState("")

  const run = async () => {
    if (!user || !resumeId) return
    try {
      setError("")
      const a = await apiFetch("/api/analysis/gap", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, resume_id: resumeId, target_role: targetRole }),
      })
      setAnalysis(a)
      localStorage.setItem("sb_analysis_id", (a as any).analysis_id)

      const m = await apiFetch<MatchItem[]>(`/api/analysis/resume-match/${resumeId}`)
      setMatches(m)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run matching")
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Resume Matching</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Resume ID" value={resumeId} onChange={(e) => setResumeId(e.target.value)} />
            <Input placeholder="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            <Button onClick={run}>Run Gap Analysis + Match</Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader><CardTitle>Gap Analysis Result</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Coverage:</strong> {analysis.coverage_score}%</p>
              <p><strong>Missing skills:</strong> {analysis.missing_skills.join(", ") || "None"}</p>
              <p><strong>Transferable skills:</strong> {analysis.transferable_skills.join(", ") || "None"}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {matches.map((m) => (
            <Card key={m.benchmark_resume_id}>
              <CardContent className="pt-6 text-sm">
                <p><strong>{m.benchmark_role}</strong> ({m.benchmark_level}) - {m.match_score}%</p>
                <p>Matched: {m.matched_skills.join(", ") || "-"}</p>
                <p>Missing: {m.missing_skills.slice(0, 5).join(", ") || "-"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
