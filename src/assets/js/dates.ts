/**
 * Cached `Intl.DateTimeFormat` instances, keyed by BCP-47 locale. Constructing
 * a formatter is comparatively expensive; posts lists format many dates with
 * the same locale, so we build each formatter once and reuse it.
 */
const formatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Get (or lazily create) the long-date formatter for a locale.
 *
 * Formatters are pinned to UTC: date-only ISO strings (`"2026-06-18"`) parse
 * as UTC midnight, so formatting them in the visitor's local zone would show
 * the previous day anywhere west of Greenwich.
 *
 * @param tag - A BCP-47 locale tag such as `"tr-TR"`.
 * @returns The shared formatter for that tag.
 */
const formatterFor = (tag: string): Intl.DateTimeFormat => {
  let formatter = formatters.get(tag);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    formatters.set(tag, formatter);
  }
  return formatter;
};

/** App locale → BCP-47 tag; locales not listed fall back to US English. */
const localeTags: Record<string, string> = {
  tr: "tr-TR",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  ko: "ko-KR",
  it: "it-IT",
  el: "el-GR",
  ja: "ja-JP",
  zh: "zh-CN",
};

/**
 * Format an ISO date string as a long, localised date.
 *
 * Uses the platform `Intl.DateTimeFormat`, so month names and ordering follow
 * the visitor's locale (e.g. `18 Haziran 2026` vs `June 18, 2026`). The date
 * is treated as a UTC calendar day, so the output is the same in every time
 * zone.
 *
 * @param iso - An ISO 8601 date string, such as `"2026-06-18"`.
 * @param locale - The active app locale code (any key of `localeTags`, e.g.
 *   `"tr"`, `"fr"`, `"ja"`); `"en"` and unknown locales fall back to US
 *   English formatting.
 * @returns The date rendered as a long date for the given locale.
 *
 * @example
 * ```ts
 * formatPostDate("2026-06-18", "tr"); // "18 Haziran 2026"
 * formatPostDate("2026-06-18", "en"); // "June 18, 2026"
 * formatPostDate("2026-06-18", "es"); // "18 de junio de 2026"
 * ```
 */
export const formatPostDate = (iso: string, locale: string): string =>
  formatterFor(localeTags[locale] ?? "en-US").format(new Date(iso));
