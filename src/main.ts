/**
 * Application entry point.
 *
 * Boots the Vue application and wires up its global plugins and assets:
 * - UIkit (with its icon pack) for the component skeleton,
 * - vue-router for client-side navigation,
 * - vue-i18n for localisation (the supported locales are defined in
 *   `assets/js/locales.ts`; the language is picked from the visitor's
 *   country before mount, see `i18n.ts`),
 * - the compiled Less theme and the global `Icon` component (inline SVGs —
 *   the site does not ship icon webfonts),
 * - the custom `v-spotlight` directive for pointer-reactive card glows.
 *
 * The assembled app is mounted onto the `#app` element in `index.html`.
 */
import { createApp } from "vue";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import i18n, { initLocale } from "./i18n";
import router from "./routes";
import spotlight from "./directives/spotlight";
import Icon from "./components/Icon.vue";
import "./assets/less/_main.less";
import App from "./App.vue";

// Register UIkit's SVG icon set so `uk-icon` / `uk-navbar-toggle-icon` render.
UIkit.use(Icons);

const app = createApp(App)
  .use(router)
  .use(i18n)
  .component("Icon", Icon)
  .directive("spotlight", spotlight);

// Resolve the visitor's language (saved choice or country lookup) before the
// first paint so the page never flashes in the wrong language. `initLocale`
// never rejects and is capped by a short timeout.
initLocale().finally(() => app.mount("#app"));
