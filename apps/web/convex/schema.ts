import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // "user" | "admin" | "premium"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    summary: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  experiences: defineTable({
    userId: v.string(),
    company: v.string(),
    title: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isCurrent: v.boolean(),
    description: v.optional(v.string()),
    achievements: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  education: defineTable({
    userId: v.string(),
    school: v.string(),
    degree: v.string(),
    field: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    gpa: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  skills: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.union(
      v.literal("technical"),
      v.literal("soft"),
      v.literal("tool"),
      v.literal("language")
    ),
    proficiency: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"]),

  certifications: defineTable({
    userId: v.string(),
    name: v.string(),
    issuer: v.string(),
    issueDate: v.string(),
    expirationDate: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    technologies: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  resumes: defineTable({
    userId: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    rawText: v.optional(v.string()),
    parsedData: v.optional(v.string()),
    parsedAt: v.optional(v.number()),
    isPrimary: v.boolean(),
    status: v.union(
      v.literal("uploaded"),
      v.literal("extracting"),
      v.literal("parsing"),
      v.literal("complete"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
