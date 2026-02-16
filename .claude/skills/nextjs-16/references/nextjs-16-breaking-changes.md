# Next.js 16 Breaking Changes

## Async Request APIs (CRITICAL)

ALL must be awaited. Sync access fully removed:

| API | Old (v15) | New (v16) |
|-----|-----------|-----------|
| params | `const { slug } = params` | `const { slug } = await params` |
| searchParams | `const { q } = searchParams` | `const { q } = await searchParams` |
| cookies() | `const c = cookies()` | `const c = await cookies()` |
| headers() | `const h = headers()` | `const h = await headers()` |
| draftMode() | `const d = draftMode()` | `const d = await draftMode()` |

Type signatures changed:
```typescript
// Page props
{ params: Promise<{ slug: string }>; searchParams: Promise<{ q: string }> }

// Layout props
{ params: Promise<{ slug: string }>; children: React.ReactNode }
```

Run `npx next typegen` to auto-generate type helpers.

## Version Requirements

| Dependency | Minimum |
|-----------|---------|
| Node.js | 20.9.0 (v18 dropped) |
| TypeScript | 5.1.0 |
| React | 19.2 |

## Middleware to Proxy

```bash
# File rename
middleware.ts -> proxy.ts

# Export rename
export function middleware(request) -> export function proxy(request)
```

- Node.js runtime ONLY (Edge not supported in proxy)
- Keep `middleware.ts` for Edge runtime compatibility
- Codemod: `npx @next/codemod@canary upgrade latest`

## Turbopack Default

- `next dev` / `next build` use Turbopack by default
- Custom `webpack()` configs IGNORED unless `--webpack` flag used
- `experimental.turbo` config key REMOVED -> use `turbopack` top-level

## Removed Features

| Feature | Replacement |
|---------|-------------|
| AMP support | Standard pages |
| `next lint` | ESLint/Biome CLI |
| `serverRuntimeConfig` | `.env` files |
| `publicRuntimeConfig` | `.env` + `NEXT_PUBLIC_` prefix |
| `experimental.ppr` | `cacheComponents: true` |
| Build size metrics | Custom analytics |
| `next/legacy/image` | `next/image` |
| `images.domains` | `images.remotePatterns` |

## Image Changes

Local images with query strings require explicit config:

```javascript
module.exports = {
  images: {
    localPatterns: [
      { pathname: '/assets/**', search: '?v=*' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
}
```

## Data Fetching Changes

- No implicit caching. `fetch()` is dynamic by default
- Replace `unstable_cache` with `use cache` directive
- `revalidateTag()` now requires cacheLife profile as 2nd arg
- See `nextjs-16-cache-components.md` for new caching model

## Migration Steps

1. `npx @next/codemod@canary upgrade latest` (auto-migration)
2. `npm install next@latest react@latest react-dom@latest`
3. Update Node.js to 20.9+
4. `npx next typegen` (async type helpers)
5. Verify all `await` on params/searchParams/cookies/headers
6. Rename middleware.ts to proxy.ts (or keep for Edge)
7. Update next.config.js (see `nextjs-16-config-and-cli.md`)
8. Migrate caching to `use cache` directive
9. Test: `next dev` then `next build`
