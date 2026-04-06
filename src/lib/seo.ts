/** Shared SEO copy — keep layout + page metadata in sync for audits. */

export const SITE_NAME = 'World Snooker Rankings'

/** ~45 chars — target 40–60 for SERP title display */
export const DEFAULT_TITLE = 'World Snooker Rankings — Top 16 free, full 64'

/** ~156 chars — target 140–160 for meta description snippets */
export const DEFAULT_DESCRIPTION =
  'World snooker rankings: top 16 free; sign in for full top 64 with countries and prize money. WST Gamechanger two-year list. Updated snapshot; not Wikipedia.'

/** ~41 chars */
export const RANKINGS_TITLE = 'World Snooker Rankings — Top 16 & full 64'

/** ~159 chars */
export const RANKINGS_DESCRIPTION =
  'WST world rankings: free top 16 here; Google sign-in for full top 64, countries & prize money. Gamechanger two-year list. Not Wikipedia—footer shows sync date.'

export const KEYWORDS = [
  'snooker rankings',
  'world snooker rankings',
  'WST',
  'World Snooker Tour',
  'snooker players',
  'prize money rankings',
  'Gamechanger',
  'world rankings',
] as const

/** Optional: set NEXT_PUBLIC_TWITTER_SITE=@YourHandle for Twitter card site/creator. */
export const TWITTER_SITE = process.env.NEXT_PUBLIC_TWITTER_SITE?.trim() || undefined

export const OG_IMAGE_ALT =
  'World Snooker Rankings — WST-style world rankings table preview'
