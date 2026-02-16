import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId, ensureUser } from "./helpers/auth";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await ensureUser(ctx);
    await getAuthUserId(ctx); // auth check
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    fileId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);

    // Check if user has other resumes; if not, make this primary
    const existing = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return await ctx.db.insert("resumes", {
      userId,
      fileId: args.fileId,
      fileName: args.fileName,
      isPrimary: existing.length === 0,
      status: "uploaded",
    });
  },
});

export const get = query({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const resume = await ctx.db.get(args.id);
    if (!resume || resume.userId !== userId) return null;
    return resume;
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("resumes"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("extracting"),
      v.literal("parsing"),
      v.literal("complete"),
      v.literal("failed")
    ),
    rawText: v.optional(v.string()),
    parsedData: v.optional(v.string()),
    parsedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const setPrimary = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const resume = await ctx.db.get(args.id);
    if (!resume || resume.userId !== userId) throw new Error("Not found");

    // Unset all other primaries
    const allResumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const r of allResumes) {
      if (r.isPrimary) {
        await ctx.db.patch(r._id, { isPrimary: false });
      }
    }

    await ctx.db.patch(args.id, { isPrimary: true });
  },
});

export const remove = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    // Delete file from storage
    await ctx.storage.delete(existing.fileId);
    await ctx.db.delete(args.id);
  },
});

// --- Internal functions for server-to-server calls (no auth required) ---

/** Get resume by ID without auth check — for use in scheduled actions */
export const internalGet = internalQuery({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Update resume status without auth check — for use in scheduled actions */
export const internalUpdateStatus = internalMutation({
  args: {
    id: v.id("resumes"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("extracting"),
      v.literal("parsing"),
      v.literal("complete"),
      v.literal("failed")
    ),
    rawText: v.optional(v.string()),
    parsedData: v.optional(v.string()),
    parsedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Resume not found");
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
  },
});
