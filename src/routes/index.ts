/**
 * Application router.
 *
 * Declares every page route, the `/link/*` social-redirect shorteners and a
 * catch-all 404. Views other than the landing page are lazy-loaded
 * (`() => import(...)`) so the initial bundle stays small — notably the blog
 * article view, which pulls in the syntax highlighter.
 *
 * It also keeps per-page SEO metadata (document title, meta description,
 * canonical URL and Open Graph tags) in sync with the active route and the
 * active locale — see {@link applyMeta}.
 */
import { watch } from "vue";
import { createWebHistory, createRouter } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";

import i18n from "../i18n";
import { applyPageMeta } from "../assets/js/meta";

import HomeView from "../views/HomeView.vue";
import LinkView from "../views/LinkView.vue";
import DiscordView from "../views/redirects/DiscordView.vue";
import FacebookView from "../views/redirects/FacebookView.vue";
import InstagramView from "../views/redirects/InstagramView.vue";
import KickView from "../views/redirects/KickView.vue";
import TiktokView from "../views/redirects/TiktokView.vue";
import TwitchView from "../views/redirects/TwitchView.vue";
import TwitterView from "../views/redirects/TwitterView.vue";
import YoutubeView from "../views/redirects/YoutubeView.vue";

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
 * Route table. `meta.titleKey` / `meta.descriptionKey` are i18n keys resolved
 * into the document metadata by {@link applyMeta}; `meta.ownMeta` marks routes
 * (the blog article) that manage their own title/description once content
 * resolves. The home page is imported eagerly for the fastest first paint;
 * everything else is code-split.
 */
const routes = [
  {
    path: "/",
    component: HomeView,
    meta: { descriptionKey: "meta.home" },
  },
  {
    path: "/projects",
    component: () => import("../views/ProjectsView.vue"),
    meta: { titleKey: "menu.projects", descriptionKey: "meta.projects" },
  },
  {
    path: "/blog",
    component: () => import("../views/BlogView.vue"),
    meta: { titleKey: "menu.blog", descriptionKey: "meta.blog" },
  },
  {
    // The per-post title/description are refined inside BlogPostView.
    path: "/blog/:slug",
    component: () => import("../views/BlogPostView.vue"),
    meta: { titleKey: "menu.blog", descriptionKey: "meta.blog", ownMeta: true },
  },
  {
    path: "/store",
    component: () => import("../views/StoreView.vue"),
    meta: { titleKey: "menu.store", descriptionKey: "meta.store" },
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
    component: () => import("../views/TosView.vue"),
    meta: { titleKey: "footer.terms", descriptionKey: "meta.legal" },
  },
  {
    path: "/cookies-policy",
    component: () => import("../views/CookiesView.vue"),
    meta: { titleKey: "footer.cookies", descriptionKey: "meta.legal" },
  },
  {
    path: "/privacy-policy",
    component: () => import("../views/PrivacyView.vue"),
    meta: { titleKey: "footer.privacy", descriptionKey: "meta.legal" },
  },
  {
    path: "/contact",
    component: () => import("../views/ContactView.vue"),
    meta: { titleKey: "menu.contact", descriptionKey: "meta.contact" },
  },
  {
    path: "/about-us",
    component: () => import("../views/AboutUsView.vue"),
    meta: { titleKey: "footer.about", descriptionKey: "meta.about" },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/NotFoundView.vue"),
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

/**
 * Apply localised document metadata (title, description, canonical and Open
 * Graph tags) for a route. Runs after every navigation and again whenever the
 * locale changes, so switching languages updates the browser tab immediately.
 * Routes flagged `meta.ownMeta` are skipped — they refine their own metadata
 * once their content resolves (e.g. a blog article's title/excerpt).
 *
 * @param to - The route to derive metadata from.
 */
const applyMeta = (to: RouteLocationNormalizedLoaded): void => {
  if (to.meta.ownMeta) return;

  const { t } = i18n.global;
  const titleKey = to.meta.titleKey as string | undefined;
  const descriptionKey = to.meta.descriptionKey as string | undefined;

  applyPageMeta({
    title: titleKey ? t(titleKey) : undefined,
    description: descriptionKey ? t(descriptionKey) : undefined,
    path: to.path,
  });
};

// Keep metadata in step with navigation…
router.afterEach((to) => applyMeta(to));

// …and with language switches (re-resolve the current route's keys).
watch(i18n.global.locale, () => applyMeta(router.currentRoute.value));

export default router;
