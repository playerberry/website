import type { Plugin } from "vite";
import { posts } from "../src/data/posts.ts";
import { SUPPORTED_LOCALES, type Locale } from "../src/assets/js/locales.ts";
import {
  ARTICLE_LOCALES,
  HREFLANG,
  LEGAL_LOCALES,
  fallbackLocaleFor,
  localizedUrl,
} from "../src/assets/js/seo.ts";

/** A sitemap entry before it is expanded per language. */
interface SitemapPage {
  path: string;
  priority: string;
  /** ISO date of the last meaningful content change, when known. */
  lastmod?: string;
  /** Languages this page has content in (default: all). */
  locales: readonly Locale[];
}

/**
 * Every indexable page. Static pages carry no `lastmod` (the sitemap protocol
 * makes it optional and a fake "today" would only mislead crawlers); the blog
 * index takes the newest post's date and each article its own.
 */
const pages = (): SitemapPage[] => {
  const newest = posts[0]?.date;
  const all = SUPPORTED_LOCALES;
  return [
    { path: "/", priority: "1.0", locales: all },
    { path: "/projects", priority: "0.8", locales: all },
    { path: "/blog", priority: "0.8", lastmod: newest, locales: all },
    { path: "/store", priority: "0.7", locales: all },
    { path: "/about-us", priority: "0.6", locales: all },
    { path: "/contact", priority: "0.6", locales: all },
    { path: "/privacy-policy", priority: "0.3", locales: LEGAL_LOCALES },
    { path: "/cookies-policy", priority: "0.3", locales: LEGAL_LOCALES },
    { path: "/terms-and-conditions", priority: "0.3", locales: LEGAL_LOCALES },
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      priority: "0.7",
      lastmod: post.date,
      locales: ARTICLE_LOCALES,
    })),
  ];
};

/**
 * Render one `<url>` per language version of a page, each listing the full
 * hreflang cluster (plus `x-default`) as Google's sitemap extension expects.
 *
 * @param page - The page to expand.
 * @returns The `<url>` elements for every language version.
 */
const urlEntries = (page: SitemapPage): string[] => {
  const links = [
    ...page.locales.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${HREFLANG[locale]}" href="${localizedUrl(page.path, locale)}" />`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(page.path, fallbackLocaleFor(page.locales))}" />`,
  ].join("\n");

  return page.locales.map((locale) =>
    [
      "  <url>",
      `    <loc>${localizedUrl(page.path, locale)}</loc>`,
      page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : "",
      `    <priority>${page.priority}</priority>`,
      links,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );
};

/**
 * Build the sitemap XML document: every static route and blog post, in every
 * language it exists in.
 *
 * @returns The complete sitemap XML.
 */
const buildSitemap = (): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages().flatMap(urlEntries).join("\n")}
</urlset>
`;

/**
 * Vite plugin that publishes `sitemap.xml` — emitted into the build output
 * and served from the dev server for previewing.
 */
export function sitemap(): Plugin {
  return {
    name: "playerberry-sitemap",

    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemap(),
      });
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req as { url?: string }).url !== "/sitemap.xml") return next();
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.end(buildSitemap());
      });
    },
  };
}
