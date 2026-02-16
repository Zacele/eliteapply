# Next.js 16 Config & CLI

## next.config.js Template

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache Components (replaces PPR)
  cacheComponents: true,

  // Turbopack config (replaces experimental.turbo)
  turbopack: {
    rules: {},
    resolveAlias: {},
  },

  // Image config
  images: {
    localPatterns: [
      { pathname: '/assets/**', search: '?v=*' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },

  // React Compiler (auto-memoization)
  experimental: {
    reactCompiler: true,
    turbopackFileSystemCacheForDev: true, // faster dev restarts
  },
};

module.exports = nextConfig;
```

## Config Migration Map

| Old (v15) | New (v16) |
|-----------|-----------|
| `experimental.turbo` | `turbopack` (top-level) |
| `experimental.ppr` | `cacheComponents: true` |
| `images.domains` | `images.remotePatterns` |
| `serverRuntimeConfig` | `.env` files |
| `publicRuntimeConfig` | `NEXT_PUBLIC_*` env vars |
| `webpack()` function | `turbopack` config or `--webpack` flag |

## CLI Commands

### Development
```bash
next dev              # Turbopack (default)
next dev --webpack    # Force webpack
next dev --turbopack  # Explicit turbopack
```

### Build
```bash
next build              # Turbopack (default)
next build --webpack    # Force webpack
next build --debug-prerender  # Debug prerender errors
```

### Type Generation
```bash
npx next typegen  # Generate async type helpers for params/searchParams
```

### Migration
```bash
npx @next/codemod@canary upgrade latest  # Auto-migration tool
```

Codemod auto-applies:
- Async params/searchParams types
- middleware -> proxy rename
- `experimental.turbo` -> `turbopack`
- Removes deprecated configs

### Removed Commands
```bash
# REMOVED in v16
next lint

# Replacements
npx eslint . --ext .js,.jsx,.ts,.tsx
npx biome check .
```

## Turbopack Configuration

```javascript
module.exports = {
  turbopack: {
    // Custom rules (replaces webpack loaders)
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Module aliases (replaces webpack resolve.alias)
    resolveAlias: {
      '@components': './src/components',
    },
  },
}
```

## Environment Detection

```typescript
// WRONG - process.argv unreliable in v16
if (process.argv.includes('dev')) { ... }

// CORRECT
if (process.env.NODE_ENV === 'development') { ... }
```

## TypeScript Config (next.config.ts)

```bash
# Enable native TS config support
next dev --experimental-next-config-strip-types
next build --experimental-next-config-strip-types
```
