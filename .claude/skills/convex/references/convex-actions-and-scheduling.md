# Convex Actions & Scheduling

## Actions

Actions run external services (APIs, third-party SDKs). They do NOT have DB access.

### Syntax

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const myAction = action({
  args: { prompt: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const response = await fetch("https://api.example.com", {
      method: "POST",
      body: JSON.stringify({ prompt: args.prompt }),
    });
    return await response.text();
  },
});
```

### Node.js Actions

Add `"use node";` at top of file when using Node.js built-in modules:

```typescript
"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
```

Add `@types/node` to `package.json` when using Node.js modules.

### Action Rules

- NEVER use `ctx.db` inside actions
- Use `ctx.runQuery` / `ctx.runMutation` to interact with DB from actions
- Only call action from action if crossing runtimes (V8 to Node); otherwise use shared helper function
- Minimize calls from actions to queries/mutations (each is a transaction, splitting risks race conditions)

## Function Calling

- `ctx.runQuery` - call query from query, mutation, or action
- `ctx.runMutation` - call mutation from mutation or action
- `ctx.runAction` - call action from action

All require a `FunctionReference` (from `api` or `internal` objects). Do NOT pass function directly.

### Cross-File Calls

```typescript
import { api, internal } from "./_generated/api";

// In an action:
const result = await ctx.runQuery(api.users.get, { userId });
await ctx.runMutation(internal.messages.write, { content });
```

### Same-File Calls (TypeScript workaround)

Add type annotation on return value for same-file calls:

```typescript
export const g = query({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
    return null;
  },
});
```

## Scheduling

### Schedule After

```typescript
await ctx.scheduler.runAfter(0, internal.ai.generateResponse, {
  channelId: args.channelId,
});
```

### Cron Jobs

Define in `convex/crons.ts`:

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Interval-based
crons.interval("cleanup", { hours: 2 }, internal.tasks.cleanup, {});

// Cron expression
crons.cron("daily report", "0 9 * * *", internal.reports.generate, {});

export default crons;
```

### Cron Rules

- Only use `crons.interval` or `crons.cron` methods
- Do NOT use `crons.hourly`, `crons.daily`, or `crons.weekly` helpers
- Both methods take a `FunctionReference`, never pass function directly
- Always import `internal` from `_generated/api`, even for functions in same file
- Register functions in `crons.ts` like any other file
- Export `crons` as default
