import { useI18n } from "vue-i18n";
import type { Locale } from "../assets/js/locales";
import { localePath } from "../assets/js/seo";

/**
 * Language-aware route paths for `<RouterLink>`s.
 *
 * Every language lives under its own URL prefix (`/tr/projects`; the default
 * language at the clean path — see `assets/js/seo.ts`), so in-app links must
 * carry the active language. Templates write language-neutral paths and map
 * them through the returned function, which keeps `router-link-active`
 * matching and avoids a redirect hop on every click.
 *
 * @returns A function mapping a neutral path to the active language's path.
 *
 * @example
 * const localePath = useLocalePath();
 * // <RouterLink :to="localePath('/projects')">
 */
export function useLocalePath() {
  const { locale } = useI18n();
  return (path: string): string => localePath(path, locale.value as Locale);
}
