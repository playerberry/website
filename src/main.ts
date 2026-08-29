/**
 * Application entry point.
 *
 * Boots the Vue application and wires up its global plugins and assets:
 * - vue-router for client-side navigation,
 * - vue-i18n for localisation (the supported locales are defined in
 *   `assets/js/locales.ts`; the language is picked from the visitor's
 *   country before mount, see `i18n.ts`),
 * - the Tailwind stylesheet (design tokens, component classes, self-hosted
 *   fonts) and the global `Icon` component (inline SVGs — the site ships no
 *   icon webfonts),
 * - the custom `v-spotlight` (pointer-reactive card glow) and `v-reveal`
 *   (scroll-in animation) directives.
 *
 * The assembled app is mounted onto the `#app` element in `index.html`.
 */
import { createApp } from "vue";
import i18n, { initLocale } from "./i18n";
import router from "./routes";
import spotlight from "./directives/spotlight";
import reveal from "./directives/reveal";
import Icon from "./components/Icon.vue";
import "./assets/css/main.css";
import App from "./App.vue";

const app = createApp(App)
  .use(router)
  .use(i18n)
  .component("Icon", Icon)
  .directive("spotlight", spotlight)
  .directive("reveal", reveal);

// Resolve the visitor's language (URL, saved choice or country lookup) and
// let the initial navigation settle — including the lazily loaded view — before
// mounting, so the first paint is the complete page in the right language
// rather than an empty shell whose footer jumps once the content arrives.
// `initLocale` never rejects and is capped by a short timeout; a failed
// navigation must not block the app either.
initLocale()
  .then(() => router.isReady())
  .catch(() => undefined)
  .finally(() => app.mount("#app"));
