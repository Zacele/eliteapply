import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

/** Get authenticated user ID from Clerk. Throws if not authenticated. */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

/** Ensure user exists in users table. Creates on first call, updates metadata on subsequent calls. Mutations only. */
export async function ensureUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (existing) {
    // Update metadata if changed
    const updates: Record<string, unknown> = {};
    if (identity.email && identity.email !== existing.email) updates.email = identity.email;
    if (identity.name !== existing.name) updates.name = identity.name;
    if (identity.pictureUrl !== existing.imageUrl) updates.imageUrl = identity.pictureUrl;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(existing._id, updates);
    }
    return existing;
  }

  // Create new user
  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    email: identity.email ?? "",
    name: identity.name,
    imageUrl: identity.pictureUrl,
    role: "user",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return await ctx.db.get(userId);
}

/** Get user by Clerk ID. Read-only, does NOT create. */
export async function getUserByClerkId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}
