/**
 * Internationalisation setup.
 *
 * Configures vue-i18n with Turkish and English message catalogues and picks
 * the initial locale from (in order) a previously saved choice, the browser
 * language, then Turkish as the default. The `<html lang>` attribute is kept
 * in sync so assistive tech and search engines see the right language.
 */
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

/** Locales the UI ships translations for. */
const supported = ["tr", "en"] as const;

/** Union of the supported locale codes (`"tr" | "en"`). */
type Locale = (typeof supported)[number];

/**
 * Resolve which locale to start in.
 *
 * Preference order: a value saved under `pb:locale` in `localStorage`, then
 * the browser's `navigator.language`, then Turkish.
 *
 * @returns The locale code to initialise vue-i18n with.
 */
const resolveLocale = (): Locale => {
  const saved = localStorage.getItem("pb:locale");
  if (saved && supported.includes(saved as Locale)) return saved as Locale;
  return navigator.language.toLowerCase().startsWith("en") ? "en" : "tr";
};

const locale = resolveLocale();
document.documentElement.lang = locale;

const i18n = createI18n({
  locale,
  fallbackLocale: "en",
  legacy: false,
  messages: {
    en,
    tr,
  },
});

export default i18n;
