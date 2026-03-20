"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { apiFormFetch } from "@/lib/api"
import type { ResumeOut } from "@/lib/types"

export default function ResumeUploadPage() {
  const router = useRouter()
  const user = getCurrentUser()
  const [title, setTitle] = useState("My Resume")
  const [created, setCreated] = useState<ResumeOut | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const uploadPdf = async () => {
    if (!user) return setError("Please sign in")
    if (!pdfFile) return setError("Please select a PDF file")
    try {
      setError("")
      const form = new FormData()
      form.append("user_id", user.id)
      form.append("title", title)
      form.append("file", pdfFile)
      const res = await apiFormFetch<ResumeOut>("/api/resumes/upload", form)
      setCreated(res)
      localStorage.setItem("sb_resume_id", res.id)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload PDF")
    }
  }

  return (
    <AppShell>
      <Card>
        <CardHeader><CardTitle>Resume Upload</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume title" />
          <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
          <Button onClick={uploadPdf}>Upload PDF & Continue</Button>
          <p className="text-xs text-muted-foreground">Only PDF upload is used. Text paste flow has been removed.</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {created && (
            <div className="text-sm">
              <p><strong>Resume ID:</strong> {created.id}</p>
              <p><strong>Parsed Skills:</strong> {created.parsed_skills.map((s) => s.name).join(", ")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
