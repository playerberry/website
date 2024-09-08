import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";
import TosView from "../views/TosView.vue";
import CookiesView from "../views/CookiesView.vue";
import PrivacyView from "../views/PrivacyView.vue";
import RedirectView from "../views/RedirectView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/terms-and-conditions", component: TosView },
  { path: "/cookies-policy", component: CookiesView },
  { path: "/privacy-policy", component: PrivacyView },
  {
    path: "/discord",
    component: RedirectView,
    beforeEnter() {
      location.href = "https://github.com";
    },
  },
  { path: "/:pathMatch(.*)*", component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
