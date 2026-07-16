/**
 * Document metadata helpers.
 *
 * Central place for writing the SEO-relevant tags of the current page: the
 * document title, `<meta name="description">`, the canonical `<link>` and the
 * Open Graph / Twitter mirrors. Used by the router (per-route metadata) and by
 * views that refine their own metadata once content resolves (blog articles).
 */

/** Absolute site origin, used to build canonical URLs. */
export const SITE = "https://playerberry.com";

/** Base site name appended to every localised page title. */
export const SITE_NAME = "PlayerBerry";

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

/** Options accepted by {@link applyPageMeta}. */
export interface PageMeta {
  /** Page title without the site name (appended automatically); omit for home. */
  title?: string;
  /** Meta description; when omitted the existing description is left as-is. */
  description?: string;
  /** Route path (e.g. `/blog/slug`) used for the canonical and `og:url`. */
  path: string;
}

/**
 * Write the full set of page metadata: title, canonical URL, description and
 * their Open Graph / Twitter mirrors.
 *
 * @param meta - The metadata to apply.
 */
export const applyPageMeta = ({ title, description, path }: PageMeta): void => {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  document.title = fullTitle;

  const canonical = `${SITE}${path === "/" ? "/" : path}`;
  const link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (link) link.href = canonical;

  setMetaTag("property", "og:title", fullTitle);
  setMetaTag("property", "og:url", canonical);
  setMetaTag("name", "twitter:title", fullTitle);

  if (description) {
    setMetaTag("name", "description", description);
    setMetaTag("property", "og:description", description);
    setMetaTag("name", "twitter:description", description);
  }
};
