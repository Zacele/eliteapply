# Convex TypeScript Patterns

## Id Types

Import from `_generated/dataModel`:

```typescript
import { Id } from "./_generated/dataModel";

// Use table-specific Id types
function processUser(userId: Id<"users">) { /* ... */ }
```

Be strict with Id types: use `Id<"users">` instead of `string`.

## Doc Types

```typescript
import { Doc } from "./_generated/dataModel";

// Full document type including system fields
type User = Doc<"users">;
// { _id: Id<"users">, _creationTime: number, name: string, ... }
```

## Record with Id Keys

```typescript
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const mapUsers = query({
  args: { userIds: v.array(v.id("users")) },
  returns: v.record(v.id("users"), v.string()),
  handler: async (ctx, args) => {
    const idToUsername: Record<Id<"users">, string> = {};
    for (const userId of args.userIds) {
      const user = await ctx.db.get(userId);
      if (user) {
        idToUsername[user._id] = user.username;
      }
    }
    return idToUsername;
  },
});
```

## Array Type Declarations

Always declare array type explicitly:

```typescript
const array: Array<string> = ["a", "b"];
```

## Record Type Declarations

Always declare record type explicitly:

```typescript
const record: Record<string, number> = { a: 1 };
```

## String Literals in Unions

Always use `as const`:

```typescript
result.push({ role: "user" as const, content: msg });
```

## Function References

```typescript
import { api, internal } from "./_generated/api";

// Public function in convex/example.ts named f
api.example.f

// Internal function in convex/example.ts named g
internal.example.g

// Nested: convex/messages/access.ts named h
api.messages.access.h
```

## Function Registration

- Public: `query`, `mutation`, `action` - exposed to internet
- Internal: `internalQuery`, `internalMutation`, `internalAction` - private
- All imported from `./_generated/server`
- CANNOT register through `api` or `internal` objects

## API Design

- File-based routing: organize files thoughtfully in `convex/` directory
- Use public functions for client-facing API
- Use internal functions for server-side logic, background jobs
- Do NOT expose sensitive logic via public functions

## tsconfig.json (convex/)

```json
{
  "compilerOptions": {
    "allowJs": true,
    "strict": true,
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "target": "ESNext",
    "lib": ["ES2021", "dom"],
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["./**/*"],
  "exclude": ["./_generated"]
}
```
