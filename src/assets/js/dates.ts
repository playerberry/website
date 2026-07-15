/**
 * Format an ISO date string as a long, localised date.
 *
 * Uses the platform `Intl.DateTimeFormat`, so month names and ordering follow
 * the visitor's locale (e.g. `18 Haziran 2026` vs `June 18, 2026`).
 *
 * @param iso - An ISO 8601 date string, such as `"2026-06-18"`.
 * @param locale - The active app locale (`"tr"` or `"en"`); anything other
 *   than `"tr"` falls back to US English formatting.
 * @returns The date rendered as `day month year` for the given locale.
 *
 * @example
 * ```ts
 * formatPostDate("2026-06-18", "tr"); // "18 Haziran 2026"
 * formatPostDate("2026-06-18", "en"); // "June 18, 2026"
 * ```
 */
export const formatPostDate = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
