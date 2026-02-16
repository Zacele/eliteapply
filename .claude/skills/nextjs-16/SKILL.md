---
name: nextjs-16
description: "Next.js 16 patterns: async params, use cache directive, Turbopack, proxy, cacheLife/cacheTag, React 19.2, migration from v15."
version: 1.0.0
---

# Next.js 16

This skill activates when building or migrating Next.js 16 applications. Overrides outdated v15 patterns.

## Critical: Async Request APIs

ALL request APIs MUST be awaited. Sync access is REMOVED.

```typescript
// params, searchParams, cookies(), headers(), draftMode()
export default async function Page({
  params, searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
}
```

```typescript
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();
```

## Critical: Caching Model

No implicit caching. Explicit opt-in with `use cache` directive:

```typescript
async function getData() {
  'use cache';
  cacheLife('hours');
  cacheTag('products');
  return await db.products.findMany();
}
```

Scope levels: file-top (page), component, function. See `references/nextjs-16-cache-components.md`.

## Critical: Removed Features

- `next lint` - REMOVED. Use ESLint/Biome CLI directly
- AMP support - REMOVED entirely
- `runtime configs` (`serverRuntimeConfig`/`publicRuntimeConfig`) - REMOVED. Use `.env`
- `experimental.turbo` - REMOVED. Use `turbopack` top-level key
- `experimental.ppr` - REMOVED. Use `cacheComponents: true`
- `images.domains` - REMOVED. Use `images.remotePatterns`
- `v.bigint()` deprecated, sync params removed, `unstable_cache` replaced by `use cache`

## Turbopack (Default Bundler)

`next dev` and `next build` use Turbopack. Custom `webpack()` configs ignored.
- Keep webpack: `next dev --webpack` / `next build --webpack`
- Migrate config: `turbopack: { rules: {}, resolveAlias: {} }`

## Middleware to Proxy

Rename `middleware.ts` to `proxy.ts`, export `proxy()` instead of `middleware()`.
Node.js runtime only. Keep `middleware.ts` if Edge runtime needed.

## Migration Command

```bash
npx @next/codemod@canary upgrade latest
npx next typegen  # Generate async type helpers
```

## Requirements

Node.js 20.9+, TypeScript 5.1+, React 19.2+

## References (load as needed)

- `references/nextjs-16-cache-components.md` - use cache, cacheLife, cacheTag, updateTag, refresh
- `references/nextjs-16-breaking-changes.md` - Full list of breaking changes and migration steps
- `references/nextjs-16-config-and-cli.md` - next.config.js updates, CLI flags, Turbopack config
- `references/nextjs-16-react-19-features.md` - React Compiler, View Transitions, Activity API
