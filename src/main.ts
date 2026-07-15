/**
 * Application entry point.
 *
 * Boots the Vue application and wires up its global plugins and assets:
 * - UIkit (with its icon pack) for the component skeleton,
 * - vue-router for client-side navigation,
 * - vue-i18n for Turkish/English localisation,
 * - Font Awesome icons and the compiled Less theme,
 * - the custom `v-spotlight` directive for pointer-reactive card glows.
 *
 * The assembled app is mounted onto the `#app` element in `index.html`.
 */
import { createApp } from "vue";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import i18n from "./i18n";
import router from "./routes";
import spotlight from "./directives/spotlight";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/less/_main.less";
import App from "./App.vue";

// Register UIkit's SVG icon set so `uk-icon` / `uk-navbar-toggle-icon` render.
UIkit.use(Icons);

createApp(App)
  .use(router)
  .use(i18n)
  .directive("spotlight", spotlight)
  .mount("#app");
