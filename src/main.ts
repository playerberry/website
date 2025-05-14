import { createApp } from "vue";
import i18n from "./i18n";
import router from "./routes";
import "./assets/css/style.css";
import App from "./App.vue";

createApp(App).use(router).use(i18n).mount("#app");
