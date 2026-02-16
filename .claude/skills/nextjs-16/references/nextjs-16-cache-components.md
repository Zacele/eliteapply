# Next.js 16 Cache Components

Replaces implicit caching with explicit `use cache` directive. Enable in config:

```javascript
// next.config.js
module.exports = { cacheComponents: true }
```

## use cache Directive

Three scope levels:

```typescript
// 1. Page-level (file top)
'use cache';
export default async function Page() { /* entire page cached */ }

// 2. Component-level
async function CachedSidebar() {
  'use cache';
  return <aside>{await getLinks()}</aside>;
}

// 3. Function-level
async function getData() {
  'use cache';
  return await db.query();
}
```

Compiler auto-generates cache keys. No manual key management.

## cacheLife API

Control cache expiration with preset profiles:

```typescript
import { cacheLife } from 'next/cache';

async function getProducts() {
  'use cache';
  cacheLife('hours');
  return await db.products.findMany();
}
```

**Built-in profiles:** `'seconds'` (5-30s), `'minutes'` (1-5m), `'hours'` (1-24h), `'days'` (1-7d), `'weeks'` (7-30d)

**Custom profile:**
```typescript
cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
```

Previously `unstable_cacheLife` - now stable, no prefix.

## cacheTag API

Tag cached data for on-demand invalidation:

```typescript
import { cacheTag } from 'next/cache';

async function getUser(id: string) {
  'use cache';
  cacheTag('user', `user-${id}`);
  return await db.user.findUnique({ where: { id } });
}
```

Previously `unstable_cacheTag` - now stable, no prefix.

## Cache Invalidation

### revalidateTag (updated)

Now requires cacheLife profile as second argument:

```typescript
import { revalidateTag } from 'next/cache';
revalidateTag('products', 'hours'); // Second arg required in v16
```

### updateTag (NEW)

Read-your-writes semantics in Server Actions. Expires cache AND immediately fetches fresh data:

```typescript
'use server';
import { updateTag } from 'next/cache';

export async function updateProduct(id: string) {
  await db.product.update({ where: { id }, data: { ... } });
  updateTag('products'); // Next read gets fresh data in SAME request
}
```

### refresh (NEW)

Refresh client router from Server Action:

```typescript
'use server';
import { refresh } from 'next/cache';

export async function createPost(data: FormData) {
  await db.post.create({ data: { ... } });
  refresh(); // Client router refreshes
}
```

## Replacing unstable_cache

```typescript
// OLD (v15)
import { unstable_cache } from 'next/cache';
const getCachedData = unstable_cache(
  async () => db.query(), ['key'], { revalidate: 3600 }
);

// NEW (v16)
async function getData() {
  'use cache';
  cacheLife('hours');
  cacheTag('data-key');
  return await db.query();
}
```

## Strategy Guidelines

1. Cache at highest level possible (page > component > function)
2. Use cacheTag for invalidation control
3. Match cacheLife to data freshness requirements
4. Prefer updateTag() in Server Actions for immediate updates
5. Dynamic by default unless explicitly cached
