"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { apiFetch } from "@/lib/api"

type Question = {
  skill: string
  level: string
  question: string
  expected_concepts: string[]
}

export default function InterviewPage() {
  const user = getCurrentUser()
  const [questions, setQuestions] = useState<Question[]>([])

  const load = async () => {
    if (!user) return
    const analysisId = typeof window !== "undefined" ? localStorage.getItem("sb_analysis_id") : null
    if (!analysisId) return
    const data = await apiFetch<{ questions: Question[] }>("/api/interview/questions", {
      method: "POST",
      body: JSON.stringify({ analysis_id: analysisId, user_id: user.id }),
    })
    setQuestions(data.questions)
  }

  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>Mock Interview Questions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={load}>Generate Questions</Button>
          <div className="grid gap-3">
            {questions.map((q, idx) => (
              <Card key={`${q.skill}-${idx}`}>
                <CardContent className="pt-6 text-sm">
                  <p><strong>{q.skill}</strong> ({q.level})</p>
                  <p>{q.question}</p>
                  <p>Expected: {q.expected_concepts.join(", ")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
