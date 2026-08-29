/**
 * Internationalisation setup.
 *
 * Configures vue-i18n with English (the fallback) bundled eagerly; every
 * other catalogue lives in its own lazy chunk and is loaded on demand the
 * first time its locale is activated, keeping the main bundle small.
 *
 * The initial locale is resolved in this order:
 * 1. the language prefix of the page URL (`/tr/...`, the language-specific
 *    URLs search engines index — see `assets/js/seo.ts`) or the legacy
 *    `?lang=<code>` parameter; it applies to this visit only and is not
 *    persisted,
 * 2. the choice saved from the header switch (`pb:locale` in `localStorage`),
 * 3. the visitor's country (resolved at the Cloudflare edge via
 *    `/cdn-cgi/trace`) through {@link localeForCountry},
 * 4. English, for unmapped countries or failed detection.
 *
 * The router then keeps the URL and the language in step (see the locale
 * guard in `routes/index.ts`).
 *
 * Catalogues without a `blog.posts` section fall back to the English
 * articles per post. See `assets/js/locales.ts` for the country → locale map
 * and the steps to add a new language.
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
import { localeOfPath } from "./assets/js/seo";

/** `localStorage` key holding the language chosen from the header switch. */
export const LOCALE_STORAGE_KEY = "pb:locale";

/** `sessionStorage` key caching the geo-detected locale for this visit. */
const GEO_CACHE_KEY = "pb:geo-locale";

/**
 * Legacy query parameter that used to select a language version of a page;
 * still honoured and redirected to the prefix form by the router.
 */
export const LOCALE_QUERY_PARAM = "lang";

/** How long to wait for the geolocation lookup before falling back (ms). */
const GEO_TIMEOUT_MS = 1500;

/**
 * Lazy loaders for every locale catalogue except English (bundled above),
 * keyed by module path.
 */
const catalogues = import.meta.glob([
  "./locales/*.json",
  "!./locales/en.json",
]) as Record<string, () => Promise<{ default: typeof en }>>;

const i18n = createI18n({
  locale: DEFAULT_LOCALE as string,
  fallbackLocale: "en",
  legacy: false,
  // Only English ships in the main bundle; the other catalogues are injected
  // by `loadLocaleMessages` the first time their locale is activated.
  messages: { en } as Record<Locale, typeof en>,
});

/**
 * Read a key from web storage, treating a blocked or unavailable store
 * (strict privacy modes, some embedded contexts) as "nothing saved".
 *
 * @param store - Which store to read.
 * @param key - The key to read.
 * @returns The stored value, or `null`.
 */
const readStorage = (
  store: "localStorage" | "sessionStorage",
  key: string,
): string | null => {
  try {
    return window[store].getItem(key);
  } catch {
    return null;
  }
};

/**
 * Write a key to web storage, ignoring a blocked or full store — persistence
 * is a convenience, never a requirement.
 *
 * @param store - Which store to write.
 * @param key - The key to write.
 * @param value - The value to store.
 */
const writeStorage = (
  store: "localStorage" | "sessionStorage",
  key: string,
  value: string,
): void => {
  try {
    window[store].setItem(key, value);
  } catch {
    // Storage unavailable; nothing to do.
  }
};

/**
 * Remember a manually chosen language so it wins over detection on later
 * visits.
 *
 * @param locale - The chosen locale.
 */
export const saveLocaleChoice = (locale: Locale): void =>
  writeStorage("localStorage", LOCALE_STORAGE_KEY, locale);

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
 * Rejects if the catalogue chunk cannot be fetched; the current locale is
 * left untouched in that case.
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
  const cached = readStorage("sessionStorage", GEO_CACHE_KEY);
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
    writeStorage("sessionStorage", GEO_CACHE_KEY, locale);
    return locale;
  } catch {
    return DEFAULT_LOCALE;
  }
};

/**
 * The locale requested by the page URL — its language prefix, or the legacy
 * `?lang=` parameter — if valid.
 *
 * @returns The requested locale, or `null`.
 */
const localeFromUrl = (): Locale | null => {
  const prefix = localeOfPath(window.location.pathname);
  if (prefix) return prefix;
  const value = new URLSearchParams(window.location.search).get(
    LOCALE_QUERY_PARAM,
  );
  return value && isSupportedLocale(value) ? value : null;
};

/**
 * Resolve and activate the initial locale before the app mounts.
 *
 * Preference order: the URL's language, the choice saved from the language
 * switch, the country-based detection, then English. Never rejects — English
 * is bundled and always activates.
 */
export const initLocale = async (): Promise<void> => {
  try {
    const saved = readStorage("localStorage", LOCALE_STORAGE_KEY);
    const locale =
      localeFromUrl() ??
      (saved && isSupportedLocale(saved) ? saved : await detectGeoLocale());
    await activateLocale(locale);
  } catch {
    // A failed catalogue fetch must not block the app; English is bundled.
    await activateLocale(DEFAULT_LOCALE);
  }
};

export default i18n;
