# Convex Schema & Storage

## Schema Definition

Always define in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }).index("by_channel", ["channelId"]),

  channels: defineTable({
    name: v.string(),
  }),
});
```

## System Fields

Automatically added to all documents (do NOT define in schema):
- `_id`: `v.id(tableName)` - unique document ID
- `_creationTime`: `v.number()` - creation timestamp

## Index Rules

- Include all index fields in the index name: `by_field1_and_field2`
- Index fields must be queried in definition order
- For querying `field1` then `field2` AND `field2` then `field1`, create separate indexes
- Indexes enable efficient queries via `withIndex()`

## HTTP Endpoints

Define in `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/echo",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    return new Response(body, { status: 200 });
  }),
});

export default http;
```

Endpoints registered at exact path specified (e.g., `/api/someRoute` = `/api/someRoute`).

## File Storage

Convex includes built-in file storage for images, videos, PDFs.

### Get File URL

```typescript
const url = await ctx.storage.getUrl(fileId);
// Returns signed URL or null if file doesn't exist
```

### File Metadata

Do NOT use deprecated `ctx.storage.getMetadata`. Query `_storage` system table instead:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFileInfo = query({
  args: { fileId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const metadata = await ctx.db.system.get(args.fileId);
    // metadata: { _id, _creationTime, contentType?, sha256, size }
    return null;
  },
});
```

### Storage Rules

- Items stored as `Blob` objects
- Convert all items to/from `Blob` when using storage
- Use `v.id("_storage")` for storage file IDs
