"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { apiFetch } from "@/lib/api"

type Roadmap = {
  items: {
    title: string
    provider: string
    duration: string
    cost_type: string
    milestone: string
  }[]
}

export default function RoadmapPage() {
  const user = getCurrentUser()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)

  const load = async () => {
    if (!user) return
    const analysisId = typeof window !== "undefined" ? localStorage.getItem("sb_analysis_id") : null
    if (!analysisId) return
    const data = await apiFetch<Roadmap>("/api/roadmap/generate", {
      method: "POST",
      body: JSON.stringify({ analysis_id: analysisId, user_id: user.id }),
    })
    setRoadmap(data)
  }

  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>Learning Roadmap</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={load}>Generate Roadmap</Button>
          <div className="grid gap-3">
            {roadmap?.items?.map((item) => (
              <Card key={`${item.title}-${item.provider}`}>
                <CardContent className="pt-6 text-sm">
                  <p><strong>{item.title}</strong></p>
                  <p>{item.provider} • {item.duration} • {item.cost_type}</p>
                  <p>Milestone: {item.milestone}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
