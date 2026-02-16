# Convex Queries & Mutations

## Queries

### Basic Query

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { channelId: v.id("channels") },
  returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    content: v.string(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
  },
});
```

### Query Rules

- Do NOT use `filter()` - define index in schema and use `withIndex()`
- Do NOT use `.delete()` on queries - `.collect()` then `ctx.db.delete(id)` each
- Use `.unique()` for single document (throws if multiple match)
- Default order: ascending `_creationTime`
- Use `.order('asc')` or `.order('desc')` to specify order
- Index-based queries follow index column order

### Async Iteration

Do NOT use `.collect()` or `.take(n)` with async iteration:

```typescript
// Correct
for await (const row of ctx.db.query("messages")) {
  // process row
}
```

## Pagination

```typescript
import { paginationOptsValidator } from "convex/server";

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator, author: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

`paginationOpts` properties:
- `numItems`: max documents to return (`v.number()`)
- `cursor`: cursor for next page (`v.union(v.string(), v.null())`)

Paginate returns:
- `page`: array of documents
- `isDone`: boolean, whether this is last page
- `continueCursor`: string cursor for next page

## Full Text Search

```typescript
const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);
```

## Mutations

### Insert

```typescript
export const create = mutation({
  args: { name: v.string() },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", { name: args.name });
  },
});
```

### Patch (shallow merge)

```typescript
await ctx.db.patch(taskId, { completed: true });
```

### Replace (full replacement)

```typescript
await ctx.db.replace(taskId, { name: "Buy milk", completed: false });
```

### Delete Pattern

```typescript
const items = await ctx.db.query("tasks")
  .withIndex("by_status", (q) => q.eq("status", "done"))
  .collect();
for (const item of items) {
  await ctx.db.delete(item._id);
}
```
