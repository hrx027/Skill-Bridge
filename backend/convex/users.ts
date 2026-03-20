import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const exists = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (exists) {
      throw new Error("Email already registered");
    }
    const userId = await ctx.db.insert("users", args);
    return await ctx.db.get(userId);
  },
});

export const findByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first();
  },
});

export const getById = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.user_id);
  },
});

export const updateUser = mutation({
  args: {
    user_id: v.id("users"),
    user: v.object({
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
      updated_at: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.user_id, args.user);
    return await ctx.db.get(args.user_id);
  },
});

export const createSession = mutation({
  args: { token: v.string(), user_id: v.id("users"), created_at: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", args);
    return { ok: true };
  },
});