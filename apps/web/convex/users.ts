import { query, mutation } from "./_generated/server";
import { ensureUser, getUserByClerkId } from "./helpers/auth";

export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getUserByClerkId(ctx);
  },
});

export const syncUser = mutation({
  handler: async (ctx) => {
    return await ensureUser(ctx);
  },
});
