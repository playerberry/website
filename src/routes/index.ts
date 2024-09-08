import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";

import LinkView from "../views/LinkView.vue";
import DiscordView from "../views/redirects/DiscordView.vue";
import FacebookView from "../views/redirects/FacebookView.vue";
import InstagramView from "../views/redirects/InstagramView.vue";
import KickView from "../views/redirects/KickView.vue";
import TickTockView from "../views/redirects/TickTockView.vue";
import TwitchView from "../views/redirects/TwitchView.vue";
import TwitterView from "../views/redirects/TwitterView.vue";
import YoutubeView from "../views/redirects/YoutubeView.vue";

import TosView from "../views/TosView.vue";
import CookiesView from "../views/CookiesView.vue";
import PrivacyView from "../views/PrivacyView.vue";
import ContactView from "../views/ContactView.vue";

import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  {
    path: "/",
    component: HomeView,
    meta: { requiresAuth: false },
  },
  {
    path: "/link",
    component: LinkView,
    meta: { requiresAuth: false },
    children: [
      {
        path: "discord",
        component: DiscordView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "instagram",
        component: InstagramView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "twitch",
        component: TwitchView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "kick",
        component: KickView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "youtube",
        component: YoutubeView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "twitter",
        component: TwitterView,
        meta: { requiresAuth: false },
        alias: "/x",
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "facebook",
        component: FacebookView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
      {
        path: "ticktock",
        component: TickTockView,
        meta: { requiresAuth: false },
        beforeEnter() {
          location.href = "https://github.com";
        },
      },
    ],
  },
  {
    path: "/terms-and-conditions",
    component: TosView,
    meta: { requiresAuth: false },
  },
  {
    path: "/cookies-policy",
    component: CookiesView,
    meta: { requiresAuth: false },
  },
  {
    path: "/privacy-policy",
    component: PrivacyView,
    meta: { requiresAuth: false },
  },
  {
    path: "/contact",
    component: ContactView,
    meta: { requiresAuth: false },
  },
  { path: "/:pathMatch(.*)*", component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth) {
    return;
  } else {
    next();
  }
});

export default router;
