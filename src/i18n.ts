/**
 * Internationalisation setup.
 *
 * Configures vue-i18n with English (the fallback) bundled eagerly; every
 * other catalogue lives in its own lazy chunk and is loaded on demand the
 * first time its locale is activated, keeping the main bundle small.
 *
 * The initial locale is country-based rather than browser-based: a manual
 * choice saved from the header switch wins, otherwise the visitor's country
 * (resolved at the Cloudflare edge via `/cdn-cgi/trace`) picks the language
 * through {@link localeForCountry}, and English is the fallback for unmapped
 * countries or failed detection. Catalogues without a `blog.posts` section
 * fall back to the English articles per post. See `assets/js/locales.ts`
 * for the country → locale map and the steps to add a new language.
 */
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  localeForCountry,
  parseTraceCountry,
  type Locale,
} from "./assets/js/locales";

/** `sessionStorage` key caching the geo-detected locale for this visit. */
const GEO_CACHE_KEY = "pb:geo-locale";

/** How long to wait for the geolocation lookup before falling back (ms). */
const GEO_TIMEOUT_MS = 1500;

/** Lazy loaders for every locale catalogue, keyed by module path. */
const catalogues = import.meta.glob("./locales/*.json") as Record<
  string,
  () => Promise<{ default: typeof en }>
>;

const i18n = createI18n({
  locale: DEFAULT_LOCALE as string,
  fallbackLocale: "en",
  legacy: false,
  // Only English ships in the main bundle; the other catalogues are injected
  // by `loadLocaleMessages` the first time their locale is activated.
  messages: { en } as Record<Locale, typeof en>,
});

/**
 * Ensure a locale's message catalogue is registered, fetching its lazy chunk
 * on first use.
 *
 * @param locale - The locale about to be activated.
 */
const loadLocaleMessages = async (locale: Locale): Promise<void> => {
  if (locale === "en" || i18n.global.availableLocales.includes(locale)) return;
  const module = await catalogues[`./locales/${locale}.json`]();
  i18n.global.setLocaleMessage(locale, module.default);
};

/**
 * Activate a locale: load its catalogue if needed, switch vue-i18n over and
 * keep `<html lang>` in sync for assistive tech and search engines.
 *
 * @param locale - The locale to activate.
 */
export const activateLocale = async (locale: Locale): Promise<void> => {
  await loadLocaleMessages(locale);
  i18n.global.locale.value = locale;
  document.documentElement.lang = locale;
};

/**
 * Detect the visitor's locale from their country.
 *
 * Reads Cloudflare's same-origin `/cdn-cgi/trace` endpoint (the `loc=` line
 * carries the ISO country code resolved at the edge) and maps the country to
 * a locale. The result is cached in `sessionStorage` so the lookup runs once
 * per visit. Any failure — dev server without Cloudflare, timeout, network
 * error — resolves to the English default.
 *
 * @returns The locale for this visitor.
 */
const detectGeoLocale = async (): Promise<Locale> => {
  const cached = sessionStorage.getItem(GEO_CACHE_KEY);
  if (cached && isSupportedLocale(cached)) return cached;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
    const response = await fetch("/cdn-cgi/trace", {
      signal: controller.signal,
    });
    clearTimeout(timer);
    const country = parseTraceCountry(await response.text());
    const locale = localeForCountry(country);
    sessionStorage.setItem(GEO_CACHE_KEY, locale);
    return locale;
  } catch {
    return DEFAULT_LOCALE;
  }
};

/**
 * Resolve and activate the initial locale before the app mounts.
 *
 * Preference order: the choice saved from the language switch (`pb:locale`
 * in `localStorage`), then the country-based detection, then English. Never
 * rejects.
 */
export const initLocale = async (): Promise<void> => {
  const saved = localStorage.getItem("pb:locale");
  const locale =
    saved && isSupportedLocale(saved) ? saved : await detectGeoLocale();
  try {
    await activateLocale(locale);
  } catch {
    // A failed catalogue fetch must not block the app; English is bundled.
    await activateLocale(DEFAULT_LOCALE);
  }
};

export default i18n;
