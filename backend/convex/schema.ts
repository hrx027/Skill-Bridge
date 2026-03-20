import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone_number: v.string(),
    dob: v.string(),
    password: v.string(),
    role: v.union(v.literal("student"), v.literal("career_switcher"), v.literal("mentor")),
    target_role: v.optional(v.union(v.string(), v.null())),
    experience_years: v.optional(v.number()),
    github_url: v.optional(v.union(v.string(), v.null())),
    linkedin_url: v.optional(v.union(v.string(), v.null())),
    education_profile: v.optional(v.any()),
    coding_profiles: v.optional(v.any()),
    bio: v.optional(v.union(v.string(), v.null())),
    created_at: v.string(),
    updated_at: v.optional(v.string()),
  })
    .index("by_email", ["email"]) 
    .index("by_role", ["role"]),

  sessions: defineTable({
    token: v.string(),
    user_id: v.id("users"),
    created_at: v.string(),
  }).index("by_token", ["token"]),

  resumes: defineTable({
    user_id: v.id("users"),
    title: v.string(),
    source: v.string(),
    raw_text: v.string(),
    parsed_skills: v.array(v.object({ name: v.string(), confidence: v.number() })),
    embedding: v.optional(v.array(v.number())),
    created_at: v.string(),
    updated_at: v.optional(v.string()),
  }).index("by_user_id", ["user_id"]),

  analyses: defineTable({
    user_id: v.id("users"),
    resume_id: v.id("resumes"),
    target_role: v.string(),
    matched_skills: v.array(v.string()),
    missing_skills: v.array(v.string()),
    transferable_skills: v.array(v.string()),
    coverage_score: v.number(),
    ai_used: v.boolean(),
    fallback_used: v.boolean(),
    created_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_resume_id", ["resume_id"]),

  roadmaps: defineTable({
    user_id: v.id("users"),
    analysis_id: v.id("analyses"),
    items: v.array(v.any()),
    ai_used: v.boolean(),
    fallback_used: v.boolean(),
    created_at: v.string(),
  }).index("by_user_id", ["user_id"]),

  interview_sets: defineTable({
    user_id: v.id("users"),
    analysis_id: v.id("analyses"),
    questions: v.array(v.any()),
    source: v.union(v.literal("ai"), v.literal("rules")),
    created_at: v.string(),
  }).index("by_user_id", ["user_id"]),

  demo_jobs: defineTable({
    job_id: v.string(),
    title: v.string(),
    company: v.string(),
    skills_required: v.array(v.string()),
  }).index("by_job_id", ["job_id"]),

  demo_resumes: defineTable({
    demo_resume_id: v.string(),
    benchmark_role: v.string(),
    benchmark_level: v.string(),
    skills: v.array(v.string()),
  }).index("by_demo_resume_id", ["demo_resume_id"]),
});