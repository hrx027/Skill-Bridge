export type Role = "student" | "career_switcher" | "mentor"

export type User = {
  id: string
  email: string
  name: string
  phone_number: string
  dob: string
  role: Role
  target_role?: string | null
  experience_years?: number
  github_url?: string | null
  linkedin_url?: string | null
  education_profile?: {
    degree?: string | null
    institution?: string | null
    branch?: string | null
    graduation_year?: number | null
  } | null
  coding_profiles?: {
    github?: string | null
    leetcode?: string | null
    codeforces?: string | null
    hackerrank?: string | null
  } | null
  bio?: string | null
  created_at: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type ResumeOut = {
  id: string
  user_id: string
  title: string
  source: string
  raw_text: string
  parsed_skills: { name: string; confidence: number }[]
  created_at: string
}

export type GapAnalysisOut = {
  analysis_id: string
  target_role: string
  matched_skills: string[]
  missing_skills: string[]
  transferable_skills: string[]
  coverage_score: number
  ai_used: boolean
  fallback_used: boolean
}

export type InsightOut = {
  summary: string
  strengths: string[]
  focus_areas: string[]
  next_30_days: string[]
  ai_used: boolean
  fallback_used: boolean
}

export type RoadmapOut = {
  roadmap_id: string
  user_id: string
  analysis_id: string
  items: {
    title: string
    provider: string
    duration: string
    cost_type: string
    milestone: string
  }[]
  ai_used: boolean
  fallback_used: boolean
}

export type InterviewSetOut = {
  set_id: string
  analysis_id: string
  user_id: string
  source: string
  questions: {
    skill: string
    level: string
    question: string
    expected_concepts: string[]
  }[]
}
