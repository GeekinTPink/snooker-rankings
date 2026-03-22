---
name: deploy-nextjs-cloudflare
description: >-
  Deploys Next.js to Cloudflare using @opennextjs/cloudflare (OpenNext) and
  Wrangler Workers with assets binding—not static Pages-only uploads. Covers
  wrangler.toml, package scripts, Git build commands, dashboard env vars, and
  NextAuth v5 (trustHost, AUTH_URL, Google OAuth). Use when deploying Next.js
  to Cloudflare, fixing OpenNext/404, wrangler Workers config, or NextAuth on
  Workers.
---

# Deploy Next.js on Cloudflare (OpenNext + Workers)

## Choose Workers (not Pages static-only)

OpenNext outputs **`.open-next/worker.js`** plus **`.open-next/assets`**. The Worker handles routing/SSR/API; assets are served via binding.

- **Wrong**: `wrangler pages deploy .open-next/assets` only → missing Worker → common **404**.
- **Right**: `wrangler deploy` / `opennextjs-cloudflare deploy` with **`main` + `[assets]`** in Wrangler config.

Official flow: [OpenNext Cloudflare get started](https://opennext.js.org/cloudflare/get-started).

## Dependencies and scripts

- Dev deps: `@opennextjs/cloudflare`, `wrangler` (v4, peer-compatible with the adapter).
- Root **`open-next.config.ts`**: use adapter defaults / `defineCloudflareConfig` per docs; avoid `export const runtime = "edge"` in app code for this stack.

**`package.json` scripts (typical):**

```json
{
  "build": "next build",
  "cf:build": "opennextjs-cloudflare build",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
}
```

`opennextjs-cloudflare deploy` runs **`wrangler deploy`** (Worker), not Pages static deploy.

## `wrangler.toml` essentials

Match Worker **`name`** and **`[[services]].service`** for self-reference.

```toml
name = "my-app"
main = ".open-next/worker.js"
compatibility_date = "YYYY-MM-DD"
compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[services]]
binding = "WORKER_SELF_REFERENCE"
service = "my-app"   # must equal name
```

Optional: D1 / R2 / Images bindings per [OpenNext docs](https://opennext.js.org/cloudflare/caching) when used.

## Cloudflare Dashboard

- **Variables**: `AUTH_SECRET`, `AUTH_URL` (or `NEXTAUTH_URL`), OAuth secrets—see NextAuth section.
- **Custom domain**: Worker triggers / custom domains for production host.
- **Git CI**: build must run **`opennextjs-cloudflare build`** (it invokes `next build`); output is **Worker + `.open-next`**, not “Next.js default output dir only”.

Add `.open-next` to `.gitignore`.

## Next.js config (local + bindings)

For local dev with Cloudflare bindings, call **`initOpenNextCloudflareForDev()`** from `@opennextjs/cloudflare` in `next.config` per [get started](https://opennext.js.org/cloudflare/get-started). Not required for production deploy correctness by itself.

## NextAuth v5 (Auth.js) on Cloudflare Workers

Workers are **not** `CF_PAGES` and often have **`NODE_ENV=production`** without `VERCEL`.

- Set **`trustHost: true`** in `NextAuth({ ... })` if `AUTH_URL` / `AUTH_TRUST_HOST` is not set—otherwise **`UntrustedHost`** → `/api/auth/error`.
- Set **`AUTH_SECRET`** (or `NEXTAUTH_SECRET`) in the Worker environment.
- Set canonical URL: **`AUTH_URL`** or **`NEXTAUTH_URL`** (e.g. `https://example.com`, no `/api/auth` path unless using a custom basePath).

### Google provider

- Env names: **`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`** (Auth.js convention) or explicit **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** if wired in `Google({ clientId, clientSecret })`.
- Google Cloud Console → OAuth client type **Web application**; **Authorized redirect URI** must include:
  `https://<your-domain>/api/auth/callback/google`
- **“The OAuth client was not found”**: invalid/missing `client_id` (wrong env name, empty value, wrong project, or non-Web client). Fix credentials and redeploy.

## Verify locally

```bash
pnpm exec opennextjs-cloudflare build
pnpm exec wrangler deploy --dry-run
```

Confirm bindings include **`ASSETS`** and **`WORKER_SELF_REFERENCE`**.

## Do not use (for this stack)

- Legacy **`@cloudflare/next-on-pages`** alongside OpenNext—remove per OpenNext migration docs.
- **`withCloudflare(nextConfig)`** from older snippets—current **`@opennextjs/cloudflare`** uses **`defineCloudflareConfig`** / `open-next.config.ts`, not that wrapper (verify package exports for the installed version).

## Reference

- [OpenNext Cloudflare](https://opennext.js.org/cloudflare/get-started)
- [Auth.js deployment / trustHost](https://authjs.dev/getting-started/deployment)
