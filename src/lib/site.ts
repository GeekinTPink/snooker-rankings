/**
 * Canonical site origin for metadataBase, sitemap, robots, and JSON-LD.
 * Production: set NEXT_PUBLIC_SITE_URL=https://your-domain.com (preferred) or AUTH_URL to the same origin.
 * Cloudflare Pages: CF_PAGES_URL is often set during build/deploy.
 */
export function resolveSiteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.AUTH_URL?.trim()
  if (raw && /^https?:\/\//i.test(raw)) {
    return new URL(raw).origin
  }
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, '')
    return `https://${host}`
  }
  const cfPages = process.env.CF_PAGES_URL?.trim()
  if (cfPages) {
    const withProto = /^https?:\/\//i.test(cfPages) ? cfPages : `https://${cfPages}`
    return new URL(withProto).origin
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  return null
}

/**
 * When set, Next.js emits absolute canonical, og:url, and Twitter URLs. Production
 * should set NEXT_PUBLIC_SITE_URL or AUTH_URL (or CF_PAGES_URL on Cloudflare Pages).
 */
export function getMetadataBase(): URL | undefined {
  const o = resolveSiteOrigin()
  if (o) return new URL(o)
  if (process.env.NODE_ENV === 'development') {
    return new URL('http://localhost:3000')
  }
  return undefined
}

export function absoluteUrl(path: string): string | null {
  const origin = resolveSiteOrigin()
  if (!origin) return null
  const p = path.startsWith('/') ? path : `/${path}`
  return `${origin}${p}`
}
