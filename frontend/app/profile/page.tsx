"use client"

import { useState } from "react"
import { useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, saveAuth, getToken } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import type { AuthResponse } from "@/lib/types"
import type { ResumeOut } from "@/lib/types"

export default function ProfilePage() {
  const user = getCurrentUser()
  const [message, setMessage] = useState("")
  const [resumes, setResumes] = useState<ResumeOut[]>([])
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    dob: user?.dob || "",
    password: "secret123",
    role: user?.role || "student",
    target_role: user?.target_role || "",
    experience_years: user?.experience_years || 0,
    github_url: user?.github_url || "",
    linkedin_url: user?.linkedin_url || "",
    bio: user?.bio || "",
  })

  const update = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }))

  const save = async () => {
    if (!user) return
    const payload = {
      ...form,
      education_profile: user.education_profile || null,
      coding_profiles: user.coding_profiles || null,
    }
    const updated = await apiFetch(`/api/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    saveAuth({ token: getToken() || "", user: updated } as AuthResponse)
    setMessage("Profile updated")
  }

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

  return (
    <AppShell>
      <Card className="mb-6">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Name" />
          <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" />
          <Input value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} placeholder="Phone" />
          <Input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} placeholder="DOB" />
          <Input value={form.target_role} onChange={(e) => update("target_role", e.target.value)} placeholder="Target role" />
          <Input value={String(form.experience_years)} onChange={(e) => update("experience_years", Number(e.target.value || 0))} placeholder="Experience years" />
          <Input value={form.github_url} onChange={(e) => update("github_url", e.target.value)} placeholder="GitHub URL" />
          <Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="LinkedIn URL" />
          <div className="md:col-span-2">
            <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Bio" />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <Button onClick={save}>Save changes</Button>
            {message && <p className="text-sm text-green-600">{message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Stored Resumes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {resumes.length === 0 && <p className="text-sm text-muted-foreground">No resumes stored yet.</p>}
          {resumes.map((resume) => (
            <div key={resume.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{resume.title}</p>
              <p className="text-muted-foreground">Source: {resume.source} • {new Date(resume.created_at).toLocaleString()}</p>
              <p className="mt-1">Skills: {resume.parsed_skills.map((s) => s.name).join(", ") || "-"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  )
}
