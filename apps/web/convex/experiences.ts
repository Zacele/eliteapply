import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId, ensureUser } from "./helpers/auth";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("experiences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    company: v.string(),
    title: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isCurrent: v.boolean(),
    description: v.optional(v.string()),
    achievements: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("experiences", { userId, ...args });
  },
});

export const update = mutation({
  args: {
    id: v.id("experiences"),
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isCurrent: v.optional(v.boolean()),
    description: v.optional(v.string()),
    achievements: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
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
  args: { id: v.id("experiences") },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
