/** Shared SEO copy — keep layout + page metadata in sync for audits. */

export const SITE_NAME = 'World Snooker Rankings'

export const DEFAULT_TITLE =
  'World Snooker Rankings — WST world rankings (Gamechanger data)'

export const DEFAULT_DESCRIPTION =
  'Official-style World Snooker Tour world rankings: ranks 1–16 free without an account; sign in with Google for the full top 64, countries, and prize money. Data from the WST Gamechanger rankings API (published two-year list), not Wikipedia.'

export const RANKINGS_TITLE =
  'World Snooker Rankings — Top 16 free, full top 64 with sign-in'

export const RANKINGS_DESCRIPTION =
  'WST Gamechanger world rankings: ranks 1–16 visible without an account. Sign in with Google for ranks 17–64 with prize money and countries. Same data source as the World Snooker Tour official-style published list (not Wikipedia).'

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
