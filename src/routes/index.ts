/**
 * Application router.
 *
 * Declares every page route, the `/link/*` social-redirect shorteners and a
 * catch-all 404. It also keeps the document title in sync with the active
 * route (localised through vue-i18n) for clearer browser tabs and better SEO.
 */
import { createWebHistory, createRouter } from "vue-router";

import i18n from "../i18n";

import HomeView from "../views/HomeView.vue";
import ProjectsView from "../views/ProjectsView.vue";
import BlogView from "../views/BlogView.vue";
import BlogPostView from "../views/BlogPostView.vue";
import StoreView from "../views/StoreView.vue";

import LinkView from "../views/LinkView.vue";
import DiscordView from "../views/redirects/DiscordView.vue";
import FacebookView from "../views/redirects/FacebookView.vue";
import InstagramView from "../views/redirects/InstagramView.vue";
import KickView from "../views/redirects/KickView.vue";
import TiktokView from "../views/redirects/TiktokView.vue";
import TwitchView from "../views/redirects/TwitchView.vue";
import TwitterView from "../views/redirects/TwitterView.vue";
import YoutubeView from "../views/redirects/YoutubeView.vue";

import TosView from "../views/TosView.vue";
import CookiesView from "../views/CookiesView.vue";
import PrivacyView from "../views/PrivacyView.vue";
import ContactView from "../views/ContactView.vue";
import AboutUsView from "../views/AboutUsView.vue";

import NotFoundView from "../views/NotFoundView.vue";

/**
 * External profile URLs for the `/link/<platform>` redirect routes. Keeping
 * every destination in one map makes the handles trivial to review and update.
 */
const socialLinks: Record<string, string> = {
  discord: "https://discord.gg/playerberry",
  instagram: "https://instagram.com/playerberry",
  twitch: "https://twitch.tv/playerberry",
  kick: "https://kick.com/playerberry",
  youtube: "https://youtube.com/@playerberry",
  twitter: "https://x.com/playerberry",
  facebook: "https://facebook.com/playerberry",
  tiktok: "https://tiktok.com/@playerberry",
};

/**
 * Build a route guard that sends the visitor to an external URL.
 *
 * @param url - Absolute destination, including protocol.
 * @returns A `beforeEnter` guard performing the redirect.
 */
const redirectTo = (url: string) => () => {
  window.location.href = url;
};

/**
 * Child routes under `/link`. Each renders a short "redirecting…" view and
 * immediately forwards to the matching social profile from {@link socialLinks}.
 */
const linkChildren = [
  { path: "discord", component: DiscordView },
  { path: "instagram", component: InstagramView },
  { path: "twitch", component: TwitchView },
  { path: "kick", component: KickView },
  { path: "youtube", component: YoutubeView },
  { path: "twitter", component: TwitterView, alias: "x" },
  { path: "facebook", component: FacebookView },
  { path: "tiktok", component: TiktokView },
].map((child) => ({
  ...child,
  beforeEnter: redirectTo(socialLinks[child.path]),
}));

/**
 * Route table. `meta.titleKey` (when present) is an i18n key resolved into the
 * document title by the global `afterEach` hook below.
 */
const routes = [
  {
    path: "/",
    component: HomeView,
  },
  {
    path: "/projects",
    component: ProjectsView,
    meta: { titleKey: "menu.projects" },
  },
  {
    path: "/blog",
    component: BlogView,
    meta: { titleKey: "menu.blog" },
  },
  {
    // The per-post title is refined inside BlogPostView once the post loads.
    path: "/blog/:slug",
    component: BlogPostView,
    meta: { titleKey: "menu.blog" },
  },
  {
    path: "/store",
    component: StoreView,
    meta: { titleKey: "menu.store" },
  },
  {
    path: "/link",
    component: LinkView,
    children: linkChildren,
  },
  {
    path: "/links",
    component: LinkView,
    beforeEnter() {
      window.location.replace("https://playerberry.com");
    },
  },
  {
    path: "/terms-and-conditions",
    component: TosView,
    meta: { titleKey: "footer.terms" },
  },
  {
    path: "/cookies-policy",
    component: CookiesView,
    meta: { titleKey: "footer.cookies" },
  },
  {
    path: "/privacy-policy",
    component: PrivacyView,
    meta: { titleKey: "footer.privacy" },
  },
  {
    path: "/contact",
    component: ContactView,
    meta: { titleKey: "menu.contact" },
  },
  {
    path: "/about-us",
    component: AboutUsView,
    meta: { titleKey: "footer.about" },
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundView,
    meta: { titleKey: "notFound.title" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  /**
   * Restore the previous scroll position on back/forward navigation, and
   * otherwise scroll to the top of the page.
   */
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

/** Base site name appended to every localised page title. */
const SITE_NAME = "PlayerBerry";

// Keep the browser tab title in step with the active route.
router.afterEach((to) => {
  const titleKey = to.meta.titleKey as string | undefined;
  document.title = titleKey
    ? `${i18n.global.t(titleKey)} — ${SITE_NAME}`
    : SITE_NAME;
});

export default router;
