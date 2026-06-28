/**
 * Canonical production origin for the marketing site.
 *
 * Used for canonical URLs, sitemap, robots, RSS, and JSON-LD so every
 * absolute URL agrees. Falls back to the production domain (never localhost)
 * so a missing env var can't ship a sitemap full of localhost URLs.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://osforms.com'
).replace(/\/$/, '');
