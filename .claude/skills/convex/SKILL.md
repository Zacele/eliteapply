---
name: convex
description: "Build Convex backends: schema, queries, mutations, actions, validators, HTTP endpoints, pagination, crons, file storage, TS patterns."
version: 1.0.0
---

# Convex

This skill activates when building Convex backend applications, writing Convex functions (queries, mutations, actions), designing schemas, or working with Convex validators and TypeScript types.

## Quick Reference

- Schema: `convex/schema.ts` using `defineSchema` + `defineTable`
- Functions: `convex/*.ts` using file-based routing
- Generated types: `convex/_generated/server` and `convex/_generated/api`

## Core Rules

- ALWAYS use new function syntax with `args` + `returns` + `handler`
- ALWAYS include argument and return validators for ALL functions
- Functions returning nothing: use `returns: v.null()` and `return null`
- Public functions: `query`, `mutation`, `action` (exposed to internet)
- Internal functions: `internalQuery`, `internalMutation`, `internalAction` (private)
- Import public refs from `api` object, internal refs from `internal` object
- File-based routing: `convex/foo.ts` export `bar` = `api.foo.bar`

## Function Syntax

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myFunc = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});
```

## Key Anti-Patterns

- Do NOT use `filter()` in queries; use `withIndex()` instead
- Do NOT use `ctx.db` inside actions (no DB access)
- Do NOT use `v.bigint()` (deprecated); use `v.int64()`
- Do NOT use `v.map()` or `v.set()` (unsupported); use `v.record()`
- Do NOT pass functions directly to `ctx.runQuery/runMutation/runAction`; pass `FunctionReference`
- Do NOT use `.delete()` on queries; `.collect()` then `ctx.db.delete(id)` each row
- Do NOT use `crons.hourly/daily/weekly` helpers; use `crons.interval` or `crons.cron`

## References (load as needed)

- `references/convex-validators-and-types.md` - Validator table, type mappings, discriminated unions
- `references/convex-queries-and-mutations.md` - Query patterns, indexes, ordering, pagination, mutations
- `references/convex-actions-and-scheduling.md` - Actions, Node.js runtime, crons, scheduler
- `references/convex-schema-and-storage.md` - Schema design, indexes, file storage, HTTP endpoints
- `references/convex-typescript-patterns.md` - Id types, Record types, function references, cross-file calls
- `references/convex-chat-app-example.md` - Complete chat app example with AI integration
