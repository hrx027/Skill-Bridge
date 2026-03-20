"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { getCurrentUser } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import type { GapAnalysisOut, InsightOut, InterviewSetOut, ResumeOut, RoadmapOut } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const user = getCurrentUser()
  const [resumes, setResumes] = useState<ResumeOut[]>([])
  const [analysis, setAnalysis] = useState<GapAnalysisOut | null>(null)
  const [insight, setInsight] = useState<InsightOut | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapOut | null>(null)
  const [interview, setInterview] = useState<InterviewSetOut | null>(null)
  const [matches, setMatches] = useState<Array<{ benchmark_role: string; benchmark_level: string; match_score: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadResumes = async () => {
      if (!user) return
      try {
        const data = await apiFetch<ResumeOut[]>(`/api/resumes/user/${user.id}`)
        setResumes(data)
      } catch {
        setResumes([])
      }
    }
    loadResumes()
  }, [user])

  const runFlow = async () => {
    if (!user || resumes.length === 0) return
    setLoading(true)
    setError("")
    try {
      const resumeId = resumes[0].id
      const gap = await apiFetch<GapAnalysisOut>("/api/analysis/gap", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, resume_id: resumeId, target_role: user.target_role || "Cloud Engineer" }),
      })
      setAnalysis(gap)
      localStorage.setItem("sb_analysis_id", gap.analysis_id)

      const aiInsight = await apiFetch<InsightOut>("/api/analysis/insights", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, analysis_id: gap.analysis_id }),
      })
      setInsight(aiInsight)

      const aiRoadmap = await apiFetch<RoadmapOut>("/api/roadmap/generate", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, analysis_id: gap.analysis_id }),
      })
      setRoadmap(aiRoadmap)

      const aiInterview = await apiFetch<InterviewSetOut>("/api/interview/questions", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, analysis_id: gap.analysis_id }),
      })
      setInterview(aiInterview)

      const matchData = await apiFetch<Array<{ benchmark_role: string; benchmark_level: string; match_score: number }>>(
        `/api/analysis/resume-match/${resumeId}`,
      )
      setMatches(matchData.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate career plan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Welcome {user?.name || "Learner"}</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Target Role</CardTitle></CardHeader>
            <CardContent>{user?.target_role || "Not set"}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
            <CardContent>{user?.experience_years || 0} years</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Mandatory Profile Status</CardTitle></CardHeader>
            <CardContent>{user?.email && user?.phone_number && user?.dob ? "Complete" : "Incomplete"}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>AI Career Copilot (Unified)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Uses your latest stored resume to generate skill-gap analysis, AI insights, roadmap, and interview questions in one flow.
            </p>
            <Button disabled={loading || resumes.length === 0} onClick={runFlow}>
              {loading ? "Generating..." : "Generate Full Plan"}
            </Button>
            {resumes.length === 0 && <p className="text-sm text-amber-600">No resume found. Upload one first.</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader><CardTitle>Skill Gap Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Target Role:</strong> {analysis.target_role}</p>
              <p><strong>Coverage:</strong> {analysis.coverage_score}%</p>
              <p><strong>Matched:</strong> {analysis.matched_skills.join(", ") || "-"}</p>
              <p><strong>Missing:</strong> {analysis.missing_skills.join(", ") || "-"}</p>
            </CardContent>
          </Card>
        )}

        {matches.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Resume Benchmark Matching</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {matches.map((m, i) => (
                <div key={`${m.benchmark_role}-${i}`} className="rounded-md border p-2">
                  <p><strong>{m.benchmark_role}</strong> ({m.benchmark_level})</p>
                  <p>Match Score: {m.match_score}%</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {insight && (
          <Card>
            <CardHeader><CardTitle>AI Insights & Suggestions</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Mode:</strong> {insight.ai_used ? "AI" : "Fallback"}</p>
              <p>{insight.summary}</p>
              <p><strong>Strengths:</strong> {insight.strengths.join(", ") || "-"}</p>
              <p><strong>Focus Areas:</strong> {insight.focus_areas.join(", ") || "-"}</p>
              <ul className="list-disc pl-6">
                {insight.next_30_days.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {roadmap && (
          <Card>
            <CardHeader><CardTitle>AI Roadmap</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {roadmap.items.map((item) => (
                <div key={`${item.title}-${item.provider}`} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.provider} • {item.duration} • {item.milestone}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {interview && (
          <Card>
            <CardHeader><CardTitle>Interview Questions ({interview.source})</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {interview.questions.map((q, idx) => (
                <div key={`${q.skill}-${idx}`} className="rounded-md border p-3 text-sm">
                  <p><strong>{q.skill}</strong> ({q.level})</p>
                  <p>{q.question}</p>
                  <p className="text-muted-foreground">Expected: {q.expected_concepts.join(", ")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
