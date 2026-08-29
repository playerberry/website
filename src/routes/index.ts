/**
 * Application router.
 *
 * Declares every page route, the `/link/*` social-redirect shorteners and a
 * catch-all 404. The home page and the tiny `/link` redirect views are
 * imported eagerly (they are almost empty, so splitting them would only add
 * requests); the content pages — projects, blog, blog article, store, legal
 * pages, contact, about, 404 — are lazy-loaded (`() => import(...)`) so the
 * initial bundle stays small, notably the blog article view, which pulls in
 * the syntax highlighter.
 *
 * It also keeps per-page SEO metadata (document title, meta description,
 * canonical URL, hreflang alternates, Open Graph tags and structured data) in
 * sync with the active route and the active locale — see {@link applyMeta}.
 */
import { watch } from "vue";
import { createWebHistory, createRouter } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";

import i18n, { LOCALE_QUERY_PARAM } from "../i18n";
import { applyPageMeta } from "../assets/js/meta";
import { DEFAULT_LOCALE, type Locale } from "../assets/js/locales";
import { LEGAL_LOCALES } from "../assets/js/seo";

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

declare module "vue-router" {
  /** Per-route metadata consumed by {@link applyMeta}. */
  interface RouteMeta {
    /** i18n key of the page title. */
    titleKey?: string;
    /** i18n key of the meta description. */
    descriptionKey?: string;
    /** Append the brand to the title (default `true`; the home title has it). */
    brand?: boolean;
    /** Keep the page (and its children) out of search indexes. */
    noindex?: boolean;
    /** The view manages its own metadata once its content resolves. */
    ownMeta?: boolean;
    /** Locales the page has real content in (default: all). */
    contentLocales?: readonly Locale[];
  }
}

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
 * Build a route guard that sends the visitor to an external URL. The route
 * still renders its brief "redirecting…" view while the browser leaves.
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
 * resolves; `meta.noindex` keeps utility routes out of search indexes.
 */
const routes = [
  {
    path: "/",
    component: HomeView,
    meta: { titleKey: "meta.titles.home", brand: false, descriptionKey: "meta.home" },
  },
  {
    path: "/projects",
    component: () => import("../views/ProjectsView.vue"),
    meta: { titleKey: "meta.titles.projects", descriptionKey: "meta.projects" },
  },
  {
    path: "/blog",
    component: () => import("../views/BlogView.vue"),
    meta: { titleKey: "meta.titles.blog", descriptionKey: "meta.blog" },
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
    meta: { titleKey: "meta.titles.store", descriptionKey: "meta.store" },
  },
  {
    // The bare `/link` has nothing to show; only its children redirect.
    path: "/link",
    component: LinkView,
    redirect: "/",
    meta: { noindex: true, titleKey: "menu.home", descriptionKey: "meta.home" },
    children: linkChildren,
  },
  {
    // Common misspelling of the shortener prefix.
    path: "/links",
    redirect: "/",
  },
  {
    path: "/terms-and-conditions",
    component: () => import("../views/TosView.vue"),
    meta: {
      titleKey: "footer.terms",
      descriptionKey: "meta.legal",
      contentLocales: LEGAL_LOCALES,
    },
  },
  {
    path: "/cookies-policy",
    component: () => import("../views/CookiesView.vue"),
    meta: {
      titleKey: "footer.cookies",
      descriptionKey: "meta.legal",
      contentLocales: LEGAL_LOCALES,
    },
  },
  {
    path: "/privacy-policy",
    component: () => import("../views/PrivacyView.vue"),
    meta: {
      titleKey: "footer.privacy",
      descriptionKey: "meta.legal",
      contentLocales: LEGAL_LOCALES,
    },
  },
  {
    path: "/contact",
    component: () => import("../views/ContactView.vue"),
    meta: { titleKey: "meta.titles.contact", descriptionKey: "meta.contact" },
  },
  {
    path: "/about-us",
    component: () => import("../views/AboutUsView.vue"),
    meta: { titleKey: "meta.titles.about", descriptionKey: "meta.about" },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/NotFoundView.vue"),
    meta: {
      titleKey: "notFound.title",
      descriptionKey: "notFound.description",
      noindex: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  /**
   * Restore the previous scroll position on back/forward navigation, keep
   * the position when only the query or hash changes on the same page (the
   * `?lang=` update on a language switch), and otherwise scroll to the top.
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});

/**
 * Apply localised document metadata (title, description, canonical, hreflang
 * alternates, Open Graph tags and breadcrumb data) for a route. Runs after
 * every navigation and again whenever the locale changes, so switching
 * languages updates the browser tab immediately. Routes flagged
 * `meta.ownMeta` are skipped — they refine their own metadata once their
 * content resolves (e.g. a blog article's title/excerpt).
 *
 * @param to - The route to derive metadata from.
 */
const applyMeta = (to: RouteLocationNormalizedLoaded): void => {
  if (to.meta.ownMeta) return;

  const { t } = i18n.global;
  const title = to.meta.titleKey ? t(to.meta.titleKey) : undefined;
  const noindex = to.matched.some((record) => record.meta.noindex);

  applyPageMeta({
    path: to.path,
    title,
    brand: to.meta.brand,
    description: to.meta.descriptionKey ? t(to.meta.descriptionKey) : undefined,
    noindex,
    contentLocales: to.meta.contentLocales,
    breadcrumb:
      title && to.path !== "/" && !noindex
        ? [{ name: title, path: to.path }]
        : undefined,
  });
};

// Carry the active language into every in-app URL: a visitor reading the
// site in a non-default language keeps `?lang=` on each page they navigate
// to, so the address bar always matches the page's canonical, shareable URL
// (see `assets/js/seo.ts`). The default language uses the clean URL.
router.beforeEach((to) => {
  const active = i18n.global.locale.value;
  if (active === DEFAULT_LOCALE || to.query[LOCALE_QUERY_PARAM] !== undefined) {
    return true;
  }
  return { ...to, query: { ...to.query, [LOCALE_QUERY_PARAM]: active } };
});

// Keep metadata in step with navigation…
router.afterEach((to) => applyMeta(to));

// …and with language switches (re-resolve the current route's keys).
watch(i18n.global.locale, () => applyMeta(router.currentRoute.value));

export default router;
