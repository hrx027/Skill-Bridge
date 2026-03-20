"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { saveAuth } from "@/lib/auth"
import type { AuthResponse } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    dob: "",
    password: "",
    role: "student",
    target_role: "Cloud Engineer",
    experience_years: 0,
    github_url: "",
    linkedin_url: "",
    degree: "",
    institution: "",
    branch: "",
    graduation_year: "",
    leetcode: "",
    codeforces: "",
    hackerrank: "",
    bio: "",
  })

  const update = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name || !form.email || !form.phone_number || !form.dob || !form.password) {
      setError("Name, email, phone, DOB and password are required")
      return
    }

    try {
      setLoading(true)
      const payload = {
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        dob: form.dob,
        password: form.password,
        role: form.role,
        target_role: form.target_role || null,
        experience_years: Number(form.experience_years || 0),
        github_url: form.github_url || null,
        linkedin_url: form.linkedin_url || null,
        education_profile: {
          degree: form.degree || null,
          institution: form.institution || null,
          branch: form.branch || null,
          graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        },
        coding_profiles: {
          github: form.github_url || null,
          leetcode: form.leetcode || null,
          codeforces: form.codeforces || null,
          hackerrank: form.hackerrank || null,
        },
        bio: form.bio || null,
      }
      const data = await apiFetch<AuthResponse>("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      saveAuth(data)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Create your Skill Bridge account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid md:grid-cols-2 gap-4" onSubmit={submit}>
            <Input placeholder="Full name *" value={form.name} onChange={(e) => update("name", e.target.value)} />
            <Input type="email" placeholder="Email *" value={form.email} onChange={(e) => update("email", e.target.value)} />
            <Input placeholder="Phone number *" value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} />
            <Input type="date" placeholder="DOB *" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
            <Input type="password" placeholder="Password *" value={form.password} onChange={(e) => update("password", e.target.value)} />
            <Input placeholder="Target role" value={form.target_role} onChange={(e) => update("target_role", e.target.value)} />
            <Input placeholder="GitHub profile" value={form.github_url} onChange={(e) => update("github_url", e.target.value)} />
            <Input placeholder="LinkedIn profile" value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} />
            <Input placeholder="Degree" value={form.degree} onChange={(e) => update("degree", e.target.value)} />
            <Input placeholder="Institution" value={form.institution} onChange={(e) => update("institution", e.target.value)} />
            <Input placeholder="Branch" value={form.branch} onChange={(e) => update("branch", e.target.value)} />
            <Input placeholder="Graduation year" value={form.graduation_year} onChange={(e) => update("graduation_year", e.target.value)} />
            <Input placeholder="LeetCode" value={form.leetcode} onChange={(e) => update("leetcode", e.target.value)} />
            <Input placeholder="Codeforces" value={form.codeforces} onChange={(e) => update("codeforces", e.target.value)} />
            <Input placeholder="HackerRank" value={form.hackerrank} onChange={(e) => update("hackerrank", e.target.value)} />
            <Input placeholder="Experience years" value={String(form.experience_years)} onChange={(e) => update("experience_years", Number(e.target.value || 0))} />
            <div className="md:col-span-2">
              <Textarea placeholder="Bio (optional)" value={form.bio} onChange={(e) => update("bio", e.target.value)} />
            </div>
            {error && <p className="md:col-span-2 text-sm text-red-500">{error}</p>}
            <div className="md:col-span-2 flex items-center justify-between">
              <Link href="/auth/signin" className="text-sm underline">Already have an account?</Link>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
