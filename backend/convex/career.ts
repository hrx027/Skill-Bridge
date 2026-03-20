import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createResume = mutation({
  args: {
    user_id: v.id("users"),
    title: v.string(),
    source: v.string(),
    raw_text: v.string(),
    parsed_skills: v.array(v.object({ name: v.string(), confidence: v.number() })),
    embedding: v.optional(v.array(v.number())),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("resumes", {
      ...args,
      embedding: args.embedding ?? [],
    });
    return await ctx.db.get(id);
  },
});

export const getResume = query({
  args: { resume_id: v.id("resumes") },
  handler: async (ctx, args) => await ctx.db.get(args.resume_id),
});

export const listResumesByUser = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("resumes").withIndex("by_user_id", (q) => q.eq("user_id", args.user_id)).collect();
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return rows;
  },
});

export const createAnalysis = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("analyses", args);
    return await ctx.db.get(id);
  },
});

export const getAnalysis = query({
  args: { analysis_id: v.id("analyses") },
  handler: async (ctx, args) => await ctx.db.get(args.analysis_id),
});

export const getLatestAnalysisByUser = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("analyses").withIndex("by_user_id", (q) => q.eq("user_id", args.user_id)).collect();
    rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return rows[rows.length - 1] ?? null;
  },
});

export const createRoadmap = mutation({
  args: {
    user_id: v.id("users"),
    analysis_id: v.id("analyses"),
    items: v.array(v.any()),
    ai_used: v.boolean(),
    fallback_used: v.boolean(),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("roadmaps", args);
    return await ctx.db.get(id);
  },
});

export const createInterviewSet = mutation({
  args: {
    user_id: v.id("users"),
    analysis_id: v.id("analyses"),
    questions: v.array(v.any()),
    source: v.union(v.literal("ai"), v.literal("rules")),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("interview_sets", args);
    return await ctx.db.get(id);
  },
});

export const listDemoJobs = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("demo_jobs").collect(),
});

export const listDemoResumes = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("demo_resumes").collect(),
});

export const seedDemoData = mutation({
  args: {
    jobs: v.array(
      v.object({
        job_id: v.string(),
        title: v.string(),
        company: v.string(),
        skills_required: v.array(v.string()),
      }),
    ),
    resumes: v.array(
      v.object({
        demo_resume_id: v.string(),
        benchmark_role: v.string(),
        benchmark_level: v.string(),
        skills: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existingJobs = await ctx.db.query("demo_jobs").first();
    if (!existingJobs) {
      for (const job of args.jobs) {
        await ctx.db.insert("demo_jobs", job);
      }
    }

    const existingResumes = await ctx.db.query("demo_resumes").first();
    if (!existingResumes) {
      for (const resume of args.resumes) {
        await ctx.db.insert("demo_resumes", resume);
      }
    }

    return { ok: true };
  },
});
