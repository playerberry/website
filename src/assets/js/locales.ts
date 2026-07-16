/**
 * Locale registry and country-based locale resolution.
 *
 * The site picks its language from the visitor's country (resolved at the
 * Cloudflare edge via `/cdn-cgi/trace`), not from the browser language:
 * visitors from Türkiye get Turkish, visitors from Spain get Spanish and
 * everyone else gets English. A manually chosen language (the header switch)
 * always wins over detection.
 *
 * Adding a language later is a three-step job: add its catalogue under
 * `src/locales/`, register it in `src/i18n.ts`, then list it in
 * {@link SUPPORTED_LOCALES} and map its countries in {@link COUNTRY_LOCALES}.
 * Countries not in the map fall back to English automatically.
 *
 * Kept free of Vue imports so the logic is unit-testable in isolation.
 */

/** Locales the UI ships translations for. */
export const SUPPORTED_LOCALES = [
  "tr",
  "en",
  "es",
  "fr",
  "de",
  "ru",
  "ko",
  "it",
  "el",
  "ja",
  "zh",
] as const;

/** Union of the supported locale codes. */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** The locale used when detection fails or a country isn't mapped. */
export const DEFAULT_LOCALE: Locale = "en";

/** Native display name per locale, shown in the language dropdown. */
export const LOCALE_NAMES: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ru: "Русский",
  ko: "한국어",
  it: "Italiano",
  el: "Ελληνικά",
  ja: "日本語",
  zh: "中文",
};

/**
 * ISO 3166-1 alpha-2 country code → locale. Countries missing from this map
 * get {@link DEFAULT_LOCALE}.
 */
export const COUNTRY_LOCALES: Record<string, Locale> = {
  TR: "tr",
  ES: "es",
  FR: "fr",
  DE: "de",
  RU: "ru",
  KR: "ko",
  IT: "it",
  GR: "el",
  JP: "ja",
  CN: "zh",
};

/**
 * RSS feed path per locale. The Turkish feed keeps its legacy name; locales
 * whose articles fall back to English link the English feed.
 */
const FEED_PATHS: Record<Locale, string> = {
  tr: "/rss.xml",
  en: "/rss-en.xml",
  es: "/rss-es.xml",
  fr: "/rss-en.xml",
  de: "/rss-en.xml",
  ru: "/rss-en.xml",
  ko: "/rss-en.xml",
  it: "/rss-en.xml",
  el: "/rss-en.xml",
  ja: "/rss-en.xml",
  zh: "/rss-en.xml",
};

/**
 * Type guard: is `value` one of the supported locale codes?
 *
 * @param value - The candidate string (e.g. from `localStorage`).
 * @returns Whether the value can safely be used as a {@link Locale}.
 */
export const isSupportedLocale = (value: string): value is Locale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

/**
 * Extract the two-letter country code from a Cloudflare `/cdn-cgi/trace`
 * response body (the `loc=XX` line).
 *
 * @param trace - The raw trace text.
 * @returns The upper-cased country code, or `null` when absent.
 */
export const parseTraceCountry = (trace: string): string | null => {
  const match = trace.match(/^loc=([A-Za-z]{2})$/m);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Resolve the locale for a visitor's country.
 *
 * @param country - An ISO 3166-1 alpha-2 code, or `null`/`undefined` when
 *   detection failed.
 * @returns The mapped locale, or {@link DEFAULT_LOCALE} when unmapped.
 */
export const localeForCountry = (country: string | null | undefined): Locale =>
  (country && COUNTRY_LOCALES[country.toUpperCase()]) || DEFAULT_LOCALE;

/**
 * The RSS feed URL for a locale (English feed for unknown values, matching
 * the site-wide English fallback).
 *
 * @param locale - The active locale code.
 * @returns The feed path to link to.
 */
export const feedPathFor = (locale: string): string =>
  isSupportedLocale(locale) ? FEED_PATHS[locale] : FEED_PATHS[DEFAULT_LOCALE];
