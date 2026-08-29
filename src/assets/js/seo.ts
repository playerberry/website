/**
 * Pure SEO head model.
 *
 * Builds everything the document `<head>` needs for a page — title, meta
 * description, canonical URL, hreflang alternates, Open Graph / Twitter
 * mirrors, robots directive and JSON-LD structured data — from a small input
 * and without touching the DOM. Two consumers share it so they can never
 * disagree: `meta.ts` applies the model to the live document at runtime, and
 * `plugins/prerender.ts` renders it into the static HTML shells emitted at
 * build time (what crawlers and social scrapers see before JavaScript runs).
 *
 * URL scheme: the default language lives at the clean path (`/projects`);
 * every other language lives under its own prefix (`/tr/projects`, `/tr/`
 * for the home page — see {@link localePath}). The router resolves the
 * language from the prefix. A page's canonical URL is its own language
 * version and its hreflang cluster lists every version plus `x-default`
 * (the default-language URL), so search engines index each language
 * separately instead of only the version served to their crawler's country.
 * The former `?lang=<code>` addressing is still accepted and redirected.
 *
 * Kept free of Vue/DOM imports so it is unit-testable and usable from the
 * Vite config.
 */
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./locales.ts";

/** Absolute site origin (no trailing slash), used to build absolute URLs. */
export const SITE = "https://playerberry.com";

/** Brand name appended to page titles and used in structured data. */
export const SITE_NAME = "PlayerBerry";

/** Social sharing image (1200×630). */
export const OG_IMAGE = `${SITE}/og-image.jpg`;

/** Square logo used as the publisher logo in structured data. */
export const SITE_LOGO = `${SITE}/icon-512.png`;

/** Open Graph locale identifier per UI locale. */
export const OG_LOCALES: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  ru: "ru_RU",
  ko: "ko_KR",
  it: "it_IT",
  el: "el_GR",
  ja: "ja_JP",
  zh: "zh_CN",
};

/** BCP 47 `hreflang` value per UI locale. */
export const HREFLANG: Record<Locale, string> = {
  tr: "tr",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  ru: "ru",
  ko: "ko",
  it: "it",
  el: "el",
  ja: "ja",
  zh: "zh-Hans",
};

/**
 * Locales that ship their own blog articles. Every other locale shows the
 * English article, so article pages only advertise these language versions
 * (mirrors the feed mapping in `locales.ts`).
 */
export const ARTICLE_LOCALES: readonly Locale[] = ["tr", "en", "es"];

/**
 * Locales the legal documents (terms, privacy, cookies) are written in. They
 * are published in Turkish only, so their pages advertise a single language
 * version.
 */
export const LEGAL_LOCALES: readonly Locale[] = ["tr"];

/**
 * Normalise a route path for URL building: strip any query/hash and trailing
 * slashes, keeping a lone `/` for the home page.
 *
 * @param path - A route path such as `/blog/slug/` or `/projects?x=1`.
 * @returns The canonical path form, e.g. `/blog/slug`.
 */
export const normalizePath = (path: string): string => {
  const trimmed = path.replace(/[?#].*$/, "").replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};

/** Matches a supported-locale prefix at the start of a path. */
const LOCALE_PREFIX = new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})(?=/|$)`);

/**
 * Route path of a page in a given language: the clean path for the default
 * locale, `/<code>` + path otherwise (`/tr/projects`; the home page becomes
 * `/tr/`, the directory form static hosting serves without a redirect).
 *
 * @param path - Language-neutral route path (any existing prefix is dropped).
 * @param locale - Language version wanted.
 * @returns The language-specific path.
 */
export const localePath = (path: string, locale: Locale): string => {
  const clean = stripLocale(normalizePath(path));
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}/` : `/${locale}${clean}`;
};

/**
 * The locale a path is prefixed with, if any.
 *
 * @param path - A route path such as `/tr/projects`.
 * @returns The prefix locale, or `null` for a clean path.
 */
export const localeOfPath = (path: string): Locale | null =>
  (LOCALE_PREFIX.exec(path)?.[1] as Locale | undefined) ?? null;

/**
 * Drop a locale prefix from a path.
 *
 * @param path - A route path such as `/tr/projects` or `/tr/`.
 * @returns The language-neutral path (`/projects`, `/`).
 */
export const stripLocale = (path: string): string =>
  normalizePath(path.replace(LOCALE_PREFIX, ""));

/**
 * Absolute URL of a page in a given language.
 *
 * @param path - Route path.
 * @param locale - Language version wanted.
 * @returns The absolute, language-specific URL.
 */
export const localizedUrl = (path: string, locale: Locale): string =>
  `${SITE}${localePath(path, locale)}`;

/**
 * The language version a page falls back to for visitors whose language it
 * has no content in — also its `x-default`. The site default when the page
 * exists in it, otherwise the page's first (primary) language.
 *
 * @param contentLocales - Locales the page has content in.
 * @returns The fallback locale.
 */
export const fallbackLocaleFor = (contentLocales: readonly Locale[]): Locale =>
  contentLocales.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : (contentLocales[0] ?? DEFAULT_LOCALE);

/** Article-specific metadata (blog posts). */
export interface ArticleMeta {
  /** Publication date, ISO 8601 (`YYYY-MM-DD`). */
  datePublished: string;
  /** Topic tags, emitted as `article:tag` and JSON-LD keywords. */
  tags: string[];
  /** BCP 47 language of the article body actually shown. */
  inLanguage: string;
}

/** One crumb of the breadcrumb trail (the home crumb is added automatically). */
export interface Crumb {
  /** Visible label. */
  name: string;
  /** Route path. */
  path: string;
}

/** What a page tells the head builder about itself. */
export interface HeadInput {
  /** Route path of the page. */
  path: string;
  /** Language of the content being shown. */
  locale: Locale;
  /** Page title; the brand is appended unless `brand` is `false`. */
  title?: string;
  /** Append ` — PlayerBerry` to the title (default `true`). */
  brand?: boolean;
  /** Meta description. */
  description?: string;
  /** Keep the page out of search indexes (404, redirect helpers). */
  noindex?: boolean;
  /**
   * Locales that have real content for this page (default: all). Drives the
   * hreflang set; when `locale` is not among them the canonical points at the
   * default language.
   */
  contentLocales?: readonly Locale[];
  /** Breadcrumb trail below the home crumb. */
  breadcrumb?: Crumb[];
  /** Label of the home crumb (localised "Home"). */
  homeLabel?: string;
  /** Alt text for the social sharing image. */
  imageAlt?: string;
  /** Present for blog articles. */
  article?: ArticleMeta;
}

/** A `<link rel="alternate" hreflang>` entry. */
export interface Alternate {
  hreflang: string;
  href: string;
}

/** The resolved head, ready to be applied to a DOM or rendered to HTML. */
export interface HeadModel {
  title: string;
  description?: string;
  canonical: string;
  alternates: Alternate[];
  robots: string;
  ogType: "website" | "article";
  ogLocale: string;
  ogLocaleAlternates: string[];
  imageAlt?: string;
  article?: ArticleMeta;
  jsonLd: Record<string, unknown>[];
}

/** Robots directive for indexable pages. */
const ROBOTS_INDEX = "index,follow,max-image-preview:large";

/**
 * Resolve a page's head model.
 *
 * @param input - The page description.
 * @returns The head model.
 */
export const buildHead = (input: HeadInput): HeadModel => {
  const path = normalizePath(input.path);
  const contentLocales = input.contentLocales ?? SUPPORTED_LOCALES;
  const fallbackLocale = fallbackLocaleFor(contentLocales);
  const contentLocale = contentLocales.includes(input.locale)
    ? input.locale
    : fallbackLocale;
  const canonical = localizedUrl(path, contentLocale);
  const brand = input.brand ?? true;
  const title = input.title
    ? brand
      ? `${input.title} — ${SITE_NAME}`
      : input.title
    : SITE_NAME;

  const alternates: Alternate[] = input.noindex
    ? []
    : [
        ...contentLocales.map((locale) => ({
          hreflang: HREFLANG[locale],
          href: localizedUrl(path, locale),
        })),
        { hreflang: "x-default", href: localizedUrl(path, fallbackLocale) },
      ];

  const jsonLd: Record<string, unknown>[] = [];

  if (input.breadcrumb?.length && !input.noindex) {
    const trail: Crumb[] = [
      { name: input.homeLabel ?? SITE_NAME, path: "/" },
      ...input.breadcrumb,
    ];
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: localizedUrl(crumb.path, contentLocale),
      })),
    });
  }

  if (input.article) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: input.title ?? SITE_NAME,
      description: input.description,
      datePublished: input.article.datePublished,
      inLanguage: input.article.inLanguage,
      keywords: input.article.tags.join(", "),
      url: canonical,
      mainEntityOfPage: canonical,
      image: OG_IMAGE,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE,
        logo: { "@type": "ImageObject", url: SITE_LOGO },
      },
    });
  }

  return {
    title,
    description: input.description,
    canonical,
    alternates,
    robots: input.noindex ? "noindex,follow" : ROBOTS_INDEX,
    ogType: input.article ? "article" : "website",
    ogLocale: OG_LOCALES[contentLocale],
    ogLocaleAlternates: contentLocales
      .filter((locale) => locale !== contentLocale)
      .map((locale) => OG_LOCALES[locale]),
    imageAlt: input.imageAlt,
    article: input.article,
    jsonLd,
  };
};

/**
 * Escape a string for use in HTML text or a double-quoted attribute.
 *
 * @param text - Raw text.
 * @returns The escaped text.
 */
export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Render a head model as static HTML tags (one per line), for the prerendered
 * page shells. The set of tags mirrors exactly what `meta.ts` manages at
 * runtime, so hydration leaves the head unchanged.
 *
 * @param model - The head model.
 * @returns HTML markup for the `<head>`.
 */
export const renderHead = (model: HeadModel): string => {
  const meta = (attr: "name" | "property", key: string, value: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
  const lines: string[] = [`<title>${escapeHtml(model.title)}</title>`];

  if (model.description) lines.push(meta("name", "description", model.description));
  lines.push(meta("name", "robots", model.robots));
  lines.push(`<link rel="canonical" href="${escapeHtml(model.canonical)}" />`);
  for (const alt of model.alternates) {
    lines.push(
      `<link rel="alternate" hreflang="${alt.hreflang}" href="${escapeHtml(alt.href)}" />`,
    );
  }

  lines.push(meta("property", "og:type", model.ogType));
  lines.push(meta("property", "og:title", model.title));
  if (model.description) {
    lines.push(meta("property", "og:description", model.description));
  }
  lines.push(meta("property", "og:url", model.canonical));
  lines.push(meta("property", "og:locale", model.ogLocale));
  for (const alt of model.ogLocaleAlternates) {
    lines.push(meta("property", "og:locale:alternate", alt));
  }
  if (model.imageAlt) lines.push(meta("property", "og:image:alt", model.imageAlt));

  lines.push(meta("name", "twitter:title", model.title));
  if (model.description) {
    lines.push(meta("name", "twitter:description", model.description));
  }
  if (model.imageAlt) lines.push(meta("name", "twitter:image:alt", model.imageAlt));

  if (model.article) {
    lines.push(
      meta("property", "article:published_time", model.article.datePublished),
    );
    for (const tag of model.article.tags) {
      lines.push(meta("property", "article:tag", tag));
    }
  }

  if (model.jsonLd.length) {
    // `<` is escaped so a `</script>` inside a string can't end the block.
    const json = JSON.stringify(model.jsonLd).replace(/</g, "\\u003c");
    lines.push(
      `<script type="application/ld+json" id="pb-ld-page">${json}</script>`,
    );
  }

  return lines.join("\n");
};
