import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId, ensureUser } from "./helpers/auth";

/** Insert all parsed resume sections into their respective tables in one transaction */
export const batchInsert = mutation({
  args: {
    resumeId: v.id("resumes"),
    profile: v.optional(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      location: v.optional(v.string()),
      summary: v.optional(v.string()),
      linkedinUrl: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
    })),
    experiences: v.optional(v.array(v.object({
      company: v.string(),
      title: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      isCurrent: v.boolean(),
      description: v.optional(v.string()),
      achievements: v.optional(v.array(v.string())),
    }))),
    education: v.optional(v.array(v.object({
      school: v.string(),
      degree: v.string(),
      field: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      gpa: v.optional(v.string()),
      description: v.optional(v.string()),
    }))),
    skills: v.optional(v.array(v.object({
      name: v.string(),
      category: v.union(v.literal("technical"), v.literal("soft"), v.literal("tool"), v.literal("language")),
      proficiency: v.optional(v.string()),
    }))),
    certifications: v.optional(v.array(v.object({
      name: v.string(),
      issuer: v.string(),
      issueDate: v.string(),
      expirationDate: v.optional(v.string()),
      credentialUrl: v.optional(v.string()),
    }))),
    projects: v.optional(v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      url: v.optional(v.string()),
      technologies: v.optional(v.array(v.string())),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);

    // Verify resume ownership
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.userId !== userId) throw new Error("Resume not found");

    // Upsert profile
    if (args.profile) {
      const existingProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (existingProfile) {
        await ctx.db.patch(existingProfile._id, { ...args.profile, updatedAt: Date.now() });
      } else {
        await ctx.db.insert("profiles", { userId, ...args.profile, updatedAt: Date.now() });
      }
    }

    // Insert experiences
    if (args.experiences) {
      for (let i = 0; i < args.experiences.length; i++) {
        await ctx.db.insert("experiences", { userId, ...args.experiences[i], order: i });
      }
    }

    // Insert education
    if (args.education) {
      for (let i = 0; i < args.education.length; i++) {
        await ctx.db.insert("education", { userId, ...args.education[i], order: i });
      }
    }

    // Insert skills
    if (args.skills) {
      for (const skill of args.skills) {
        await ctx.db.insert("skills", { userId, ...skill });
      }
    }

    // Insert certifications
    if (args.certifications) {
      for (const cert of args.certifications) {
        await ctx.db.insert("certifications", { userId, ...cert });
      }
    }

    // Insert projects
    if (args.projects) {
      for (const project of args.projects) {
        await ctx.db.insert("projects", { userId, ...project });
      }
    }

    // Update resume status
    await ctx.db.patch(args.resumeId, { status: "complete", parsedAt: Date.now() });
  },
});
