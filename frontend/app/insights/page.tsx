"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { apiFetch } from "@/lib/api"

type Insight = {
  summary: string
  strengths: string[]
  focus_areas: string[]
  next_30_days: string[]
  ai_used: boolean
  fallback_used: boolean
}

export default function InsightsPage() {
  const user = getCurrentUser()
  const [insight, setInsight] = useState<Insight | null>(null)
  const [error, setError] = useState("")

  const load = async () => {
    if (!user) return
    try {
      setError("")
      const analysisId = typeof window !== "undefined" ? localStorage.getItem("sb_analysis_id") : null
      const data = await apiFetch<Insight>("/api/analysis/insights", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, analysis_id: analysisId }),
      })
      setInsight(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights")
    }
  }

  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>AI Career Insights (Groq)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={load}>Generate Insights</Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {insight && (
            <div className="space-y-3 text-sm">
              <p><strong>Mode:</strong> {insight.ai_used ? "AI" : "Fallback"}</p>
              <p><strong>Summary:</strong> {insight.summary}</p>
              <p><strong>Strengths:</strong> {insight.strengths.join(", ") || "-"}</p>
              <p><strong>Focus Areas:</strong> {insight.focus_areas.join(", ") || "-"}</p>
              <ul className="list-disc pl-6">
                {insight.next_30_days.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
