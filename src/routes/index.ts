/**
 * Application router.
 *
 * Every page lives under an optional language prefix — `/projects` is the
 * default language (English), `/tr/projects` Turkish, `/tr/` the Turkish
 * home page — so each language version has its own indexable URL (see
 * `assets/js/seo.ts`). The prefix is the source of truth for the active
 * language: the {@link localeGuard} activates it, sends a bare path to the
 * active language's prefix, and redirects the legacy `?lang=` addressing.
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
import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteRecordRaw,
} from "vue-router";

import i18n, { LOCALE_QUERY_PARAM, activateLocale } from "../i18n";
import { applyPageMeta } from "../assets/js/meta";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "../assets/js/locales";
import { LEGAL_LOCALES, localePath, stripLocale } from "../assets/js/seo";

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
 * Page routes, relative to the optional language prefix. `meta.titleKey` /
 * `meta.descriptionKey` are i18n keys resolved into the document metadata by
 * {@link applyMeta}; `meta.ownMeta` marks routes (the blog article) that
 * manage their own title/description once content resolves; `meta.noindex`
 * keeps utility routes out of search indexes.
 */
const pages: RouteRecordRaw[] = [
  {
    path: "",
    component: HomeView,
    meta: { titleKey: "meta.titles.home", brand: false, descriptionKey: "meta.home" },
  },
  {
    path: "projects",
    component: () => import("../views/ProjectsView.vue"),
    meta: { titleKey: "meta.titles.projects", descriptionKey: "meta.projects" },
  },
  {
    path: "blog",
    component: () => import("../views/BlogView.vue"),
    meta: { titleKey: "meta.titles.blog", descriptionKey: "meta.blog" },
  },
  {
    // The per-post title/description are refined inside BlogPostView.
    path: "blog/:slug",
    component: () => import("../views/BlogPostView.vue"),
    meta: { titleKey: "menu.blog", descriptionKey: "meta.blog", ownMeta: true },
  },
  {
    path: "store",
    component: () => import("../views/StoreView.vue"),
    meta: { titleKey: "meta.titles.store", descriptionKey: "meta.store" },
  },
  {
    // The bare `/link` has nothing to show; only its children redirect.
    path: "link",
    component: LinkView,
    redirect: "/",
    meta: { noindex: true, titleKey: "menu.home", descriptionKey: "meta.home" },
    children: linkChildren,
  },
  {
    // Common misspelling of the shortener prefix.
    path: "links",
    redirect: "/",
  },
  {
    path: "terms-and-conditions",
    component: () => import("../views/TosView.vue"),
    meta: {
      titleKey: "footer.terms",
      descriptionKey: "meta.legal",
      contentLocales: LEGAL_LOCALES,
    },
  },
  {
    path: "cookies-policy",
    component: () => import("../views/CookiesView.vue"),
    meta: {
      titleKey: "footer.cookies",
      descriptionKey: "meta.legal",
      contentLocales: LEGAL_LOCALES,
    },
  },
  {
    path: "privacy-policy",
    component: () => import("../views/PrivacyView.vue"),
    meta: {
      titleKey: "footer.privacy",
      descriptionKey: "meta.legal",
      contentLocales: LEGAL_LOCALES,
    },
  },
  {
    path: "contact",
    component: () => import("../views/ContactView.vue"),
    meta: { titleKey: "meta.titles.contact", descriptionKey: "meta.contact" },
  },
  {
    path: "about-us",
    component: () => import("../views/AboutUsView.vue"),
    meta: { titleKey: "meta.titles.about", descriptionKey: "meta.about" },
  },
  {
    path: ":pathMatch(.*)*",
    component: () => import("../views/NotFoundView.vue"),
    meta: {
      titleKey: "notFound.title",
      descriptionKey: "notFound.description",
      noindex: true,
    },
  },
];

/**
 * Route table: every page once, under an optional `/<locale>` prefix limited
 * to the supported codes so `/training` still reaches the 404 route rather
 * than being read as a language.
 */
const routes: RouteRecordRaw[] = [
  {
    path: `/:locale(${SUPPORTED_LOCALES.join("|")})?`,
    children: pages,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  /**
   * Restore the previous scroll position on back/forward navigation, keep
   * the position when the page stays the same (a language switch, a query or
   * hash change), and otherwise scroll to the top.
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (stripLocale(to.path) === stripLocale(from.path)) return false;
    return { top: 0 };
  },
});

/**
 * Resolve the language from the URL before every navigation.
 *
 * - `?lang=<code>` (the former addressing) is redirected to the prefix form.
 * - An explicit default-language prefix (`/en/...`) is redirected to the
 *   clean path so the default language has exactly one URL.
 * - A supported prefix activates that language (loading its catalogue on
 *   first use); the URL wins over any saved preference for this visit.
 * - A bare path while a non-default language is active (the country-based
 *   choice on first load, a saved choice, or a stray language-neutral link)
 *   is sent to that language's prefix, so the address bar always shows the
 *   page's canonical, shareable URL.
 *
 * @param to - The target route.
 * @returns `true` to proceed, or the location to redirect to.
 */
const localeGuard = async (
  to: RouteLocationNormalizedLoaded,
): Promise<boolean | RouteLocationRaw> => {
  const active = i18n.global.locale.value as Locale;
  const clean = stripLocale(to.path);

  const legacy = to.query[LOCALE_QUERY_PARAM];
  if (typeof legacy === "string" && isSupportedLocale(legacy)) {
    const query = { ...to.query };
    delete query[LOCALE_QUERY_PARAM];
    return { path: localePath(clean, legacy), query, hash: to.hash, replace: true };
  }

  const prefix = to.params.locale;
  if (typeof prefix === "string" && prefix) {
    if (prefix === DEFAULT_LOCALE) {
      return { path: clean, query: to.query, hash: to.hash, replace: true };
    }
    if (isSupportedLocale(prefix) && prefix !== active) {
      try {
        await activateLocale(prefix);
      } catch {
        // The catalogue could not be fetched; stay in the current language.
        return { path: localePath(clean, active), query: to.query, hash: to.hash };
      }
    }
    return true;
  }

  if (active !== DEFAULT_LOCALE) {
    return {
      path: localePath(clean, active),
      query: to.query,
      hash: to.hash,
      replace: true,
    };
  }
  return true;
};

router.beforeEach(localeGuard);

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
  const path = stripLocale(to.path);
  const title = to.meta.titleKey ? t(to.meta.titleKey) : undefined;
  const noindex = to.matched.some((record) => record.meta.noindex);

  applyPageMeta({
    path,
    title,
    brand: to.meta.brand,
    description: to.meta.descriptionKey ? t(to.meta.descriptionKey) : undefined,
    noindex,
    contentLocales: to.meta.contentLocales,
    breadcrumb:
      title && path !== "/" && !noindex ? [{ name: title, path }] : undefined,
  });
};

// Keep metadata in step with navigation…
router.afterEach((to) => applyMeta(to));

// …and with language switches (re-resolve the current route's keys).
watch(i18n.global.locale, () => applyMeta(router.currentRoute.value));

export default router;
