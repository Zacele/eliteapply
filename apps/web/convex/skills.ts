import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId, ensureUser } from "./helpers/auth";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("skills")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listByCategory = query({
  args: { category: v.union(v.literal("technical"), v.literal("soft"), v.literal("tool"), v.literal("language")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("skills")
      .withIndex("by_userId_category", (q) => q.eq("userId", userId).eq("category", args.category))
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    category: v.union(v.literal("technical"), v.literal("soft"), v.literal("tool"), v.literal("language")),
    proficiency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("skills", { userId, ...args });
  },
});

export const update = mutation({
  args: {
    id: v.id("skills"),
    name: v.optional(v.string()),
    category: v.optional(v.union(v.literal("technical"), v.literal("soft"), v.literal("tool"), v.literal("language"))),
    proficiency: v.optional(v.string()),
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
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const batchAdd = mutation({
  args: {
    skills: v.array(v.object({
      name: v.string(),
      category: v.union(v.literal("technical"), v.literal("soft"), v.literal("tool"), v.literal("language")),
      proficiency: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    const userId = await getAuthUserId(ctx);
    const ids = [];
    for (const skill of args.skills) {
      const id = await ctx.db.insert("skills", { userId, ...skill });
      ids.push(id);
    }
    return ids;
  },
});
