/**
 * Document metadata helpers.
 *
 * Applies a page's SEO head (built by {@link buildHead} in `seo.ts`) to the
 * live document: title, `<meta name="description">`, robots directive, the
 * canonical `<link>`, hreflang alternates, the Open Graph / Twitter mirrors,
 * article tags and the per-page JSON-LD block. Used by the router (per-route
 * metadata) and by views that refine their own metadata once content resolves
 * (blog articles).
 *
 * The same tags exist in the prerendered HTML shells (`plugins/prerender.ts`),
 * so this module only ever updates or replaces — it never leaves stale tags
 * from a previous page behind.
 */
import i18n from "../../i18n";
import type { Locale } from "./locales";
import { buildHead, type HeadInput, type HeadModel } from "./seo";

export { SITE, SITE_NAME } from "./seo";

/** Element id of the per-page JSON-LD block. */
const JSON_LD_ID = "pb-ld-page";

/**
 * Set (or create) a `<meta>` tag identified by an attribute/value pair.
 *
 * @param attr - The identifying attribute (`"name"` or `"property"`).
 * @param key - The attribute value (e.g. `"description"`, `"og:title"`).
 * @param content - The content to set.
 */
const setMetaTag = (attr: string, key: string, content: string): void => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/**
 * Remove every `<meta>` tag matching an attribute/value pair.
 *
 * @param attr - The identifying attribute.
 * @param key - The attribute value.
 */
const removeMetaTags = (attr: string, key: string): void => {
  document.head
    .querySelectorAll(`meta[${attr}="${key}"]`)
    .forEach((el) => el.remove());
};

/**
 * Set a `<meta>` tag when a value is present, otherwise remove it — so an
 * optional value from the previous page never lingers.
 *
 * @param attr - The identifying attribute.
 * @param key - The attribute value.
 * @param content - The content, or `undefined` to remove the tag.
 */
const setOptionalMetaTag = (
  attr: string,
  key: string,
  content: string | undefined,
): void => {
  if (content) setMetaTag(attr, key, content);
  else removeMetaTags(attr, key);
};

/**
 * Set (or create) a `<link>` identified by its `rel`.
 *
 * @param rel - The link relation.
 * @param href - The URL.
 */
const setLink = (rel: string, href: string): void => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

/**
 * Replace the hreflang alternate links with a new set.
 *
 * @param model - The head model providing the alternates.
 */
const setAlternates = (model: HeadModel): void => {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());
  for (const alt of model.alternates) {
    const el = document.createElement("link");
    el.rel = "alternate";
    el.hreflang = alt.hreflang;
    el.href = alt.href;
    document.head.appendChild(el);
  }
};

/**
 * Replace the per-page JSON-LD block (or remove it when there is nothing to
 * say). The site-wide Organization/WebSite block in `index.html` is separate
 * and untouched.
 *
 * @param model - The head model providing the structured data.
 */
const setJsonLd = (model: HeadModel): void => {
  let el = document.getElementById(JSON_LD_ID);
  if (!model.jsonLd.length) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.id = JSON_LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(model.jsonLd);
};

/**
 * Options accepted by {@link applyPageMeta}: the head input minus what this
 * module fills in from the active locale (`locale`, `homeLabel`, `imageAlt`).
 */
export type PageMeta = Omit<HeadInput, "locale" | "homeLabel" | "imageAlt"> & {
  /** Language of the content shown; defaults to the active UI locale. */
  locale?: Locale;
};

/**
 * Write the full set of page metadata for a page.
 *
 * @param meta - The page description.
 */
export const applyPageMeta = (meta: PageMeta): void => {
  const { t, locale } = i18n.global;
  const model = buildHead({
    ...meta,
    locale: meta.locale ?? (locale.value as Locale),
    homeLabel: t("menu.home"),
    imageAlt: t("meta.ogAlt"),
  });

  document.title = model.title;
  setOptionalMetaTag("name", "description", model.description);
  setMetaTag("name", "robots", model.robots);
  setLink("canonical", model.canonical);
  setAlternates(model);

  setMetaTag("property", "og:type", model.ogType);
  setMetaTag("property", "og:title", model.title);
  setOptionalMetaTag("property", "og:description", model.description);
  setMetaTag("property", "og:url", model.canonical);
  setMetaTag("property", "og:locale", model.ogLocale);
  removeMetaTags("property", "og:locale:alternate");
  for (const alt of model.ogLocaleAlternates) {
    const el = document.createElement("meta");
    el.setAttribute("property", "og:locale:alternate");
    el.setAttribute("content", alt);
    document.head.appendChild(el);
  }
  setOptionalMetaTag("property", "og:image:alt", model.imageAlt);

  setMetaTag("name", "twitter:title", model.title);
  setOptionalMetaTag("name", "twitter:description", model.description);
  setOptionalMetaTag("name", "twitter:image:alt", model.imageAlt);

  removeMetaTags("property", "article:published_time");
  removeMetaTags("property", "article:tag");
  if (model.article) {
    setMetaTag("property", "article:published_time", model.article.datePublished);
    for (const tag of model.article.tags) {
      const el = document.createElement("meta");
      el.setAttribute("property", "article:tag");
      el.setAttribute("content", tag);
      document.head.appendChild(el);
    }
  }

  setJsonLd(model);
};
