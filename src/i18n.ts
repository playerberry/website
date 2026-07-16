/**
 * Internationalisation setup.
 *
 * Configures vue-i18n with the Turkish, English and Spanish catalogues. The
 * initial locale is country-based rather than browser-based: a manual choice
 * saved from the header switch wins, otherwise the visitor's country
 * (resolved at the Cloudflare edge via `/cdn-cgi/trace`) picks the language
 * through {@link localeForCountry}, and English is the fallback for unmapped
 * countries or failed detection. See `assets/js/locales.ts` for the
 * country → locale map and the steps to add a new language.
 */
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import tr from "./locales/tr.json";
import es from "./locales/es.json";
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

const i18n = createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: "en",
  legacy: false,
  messages: {
    en,
    tr,
    es,
  },
});

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
 * in `localStorage`), then the country-based detection, then English. Also
 * keeps `<html lang>` in sync so assistive tech and search engines see the
 * right language. Never rejects.
 */
export const initLocale = async (): Promise<void> => {
  const saved = localStorage.getItem("pb:locale");
  const locale =
    saved && isSupportedLocale(saved) ? saved : await detectGeoLocale();
  i18n.global.locale.value = locale;
  document.documentElement.lang = locale;
};

export default i18n;
