import { createWebHistory, createRouter } from "vue-router";

import Home from "../components/Home.vue";
import Tos from "../components/Tos.vue";
import Cookies from "../components/Cookies.vue";
import Privacy from "../components/Privacy.vue";
import Redirect from "../components/Redirect.vue";
import NotFound from "../components/NotFound.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/terms-and-conditions", component: Tos },
  { path: "/cookies-policy", component: Cookies },
  { path: "/privacy-policy", component: Privacy },
  {
    path: "/discord",
    component: Redirect,
    beforeEnter() {
      location.href = "https://github.com";
    },
  },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
