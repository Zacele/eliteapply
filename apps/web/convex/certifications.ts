import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId, ensureUser } from "./helpers/auth";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("certifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    issuer: v.string(),
    issueDate: v.string(),
    expirationDate: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("certifications", { userId, ...args });
  },
});

export const update = mutation({
  args: {
    id: v.id("certifications"),
    name: v.optional(v.string()),
    issuer: v.optional(v.string()),
    issueDate: v.optional(v.string()),
    expirationDate: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("certifications") },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
