# Convex Validators & Types

## Validator Import

```typescript
import { v } from "convex/values";
```

## Type-Validator Mapping

| Convex Type | TS Type     | Example          | Validator                         |
|-------------|-------------|------------------|-----------------------------------|
| Id          | string      | `doc._id`        | `v.id(tableName)`                 |
| Null        | null        | `null`           | `v.null()`                        |
| Int64       | bigint      | `3n`             | `v.int64()`                       |
| Float64     | number      | `3.1`            | `v.number()`                      |
| Boolean     | boolean     | `true`           | `v.boolean()`                     |
| String      | string      | `"abc"`          | `v.string()`                      |
| Bytes       | ArrayBuffer | `new ArrayBuffer` | `v.bytes()`                      |
| Array       | Array       | `[1, "abc"]`     | `v.array(values)`                 |
| Object      | Object      | `{a: "abc"}`     | `v.object({prop: value})`         |
| Record      | Record      | `{"a": "1"}`     | `v.record(keys, values)`          |

## Important Notes

- `undefined` is NOT a valid Convex value. Use `null` instead
- Functions returning `undefined` or nothing return `null` to client
- `v.bigint()` is deprecated - use `v.int64()`
- `v.map()` and `v.set()` are NOT supported - use `v.record()`
- Arrays: max 8192 values
- Objects: max 1024 entries. Field names must be nonempty, cannot start with `$` or `_`
- Records: keys must be ASCII, nonempty, cannot start with `$` or `_`
- Strings: must be valid Unicode, max 1MB UTF-8 encoded

## Array Validator

```typescript
export default mutation({
  args: {
    simpleArray: v.array(v.union(v.string(), v.number())),
  },
  handler: async (ctx, args) => { /* ... */ },
});
```

## Discriminated Union

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  results: defineTable(
    v.union(
      v.object({
        kind: v.literal("error"),
        errorMessage: v.string(),
      }),
      v.object({
        kind: v.literal("success"),
        value: v.number(),
      }),
    ),
  ),
});
```

## Optional Fields

Use `v.optional()` to mark fields as optional:

```typescript
v.object({
  name: v.string(),
  email: v.optional(v.string()),
})
```
