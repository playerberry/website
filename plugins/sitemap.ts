import type { Plugin } from "vite";
import { posts } from "../src/data/posts";

/** Absolute site origin used for sitemap URLs. */
const SITE = "https://playerberry.com";

/** Static, indexable routes with their relative crawl priority. */
const staticRoutes: Array<{ path: string; priority: string }> = [
  { path: "/", priority: "1.0" },
  { path: "/projects", priority: "0.8" },
  { path: "/blog", priority: "0.8" },
  { path: "/store", priority: "0.7" },
  { path: "/about-us", priority: "0.6" },
  { path: "/contact", priority: "0.6" },
  { path: "/privacy-policy", priority: "0.3" },
  { path: "/cookies-policy", priority: "0.3" },
  { path: "/terms-and-conditions", priority: "0.3" },
];

/**
 * Build the sitemap XML document: every static route plus one entry per blog
 * post (with `lastmod` from the post's publication date).
 *
 * @returns The complete sitemap XML.
 */
const buildSitemap = (): string => {
  const today = new Date().toISOString().slice(0, 10);

  const staticEntries = staticRoutes.map(
    ({ path, priority }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`,
  );

  const postEntries = posts.map(
    (post) => `  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <priority>0.7</priority>
  </url>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries].join("\n")}
</urlset>
`;
};

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
