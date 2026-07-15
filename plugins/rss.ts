import type { Plugin } from "vite";
import { posts } from "../src/data/posts";
import trMessages from "../src/locales/tr.json";
import enMessages from "../src/locales/en.json";

/** Absolute site origin used for feed and item links. */
const SITE = "https://playerberry.com";

/** The subset of localised content the feed needs from a post. */
interface FeedPost {
  title: string;
  excerpt: string;
  body: string[];
}

/** The subset of the locale messages the feed reads. */
interface FeedMessages {
  blog: {
    lead: string;
    posts: Record<string, FeedPost>;
  };
}

const locales: Record<string, { messages: FeedMessages; file: string }> = {
  tr: { messages: trMessages as unknown as FeedMessages, file: "rss.xml" },
  en: { messages: enMessages as unknown as FeedMessages, file: "rss-en.xml" },
};

/** Escape a string for safe inclusion in XML/HTML text and attributes. */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Render a line's inline `code` spans, escaping everything else. */
const inline = (text: string): string =>
  text
    .split("`")
    .map((part, i) =>
      i % 2 === 1 ? `<code>${escapeHtml(part)}</code>` : escapeHtml(part),
    )
    .join("");

/**
 * Convert a post body (the same `## ` / `> ` / ``` block convention used on
 * the site) into a self-contained HTML fragment for `content:encoded`.
 */
const bodyToHtml = (body: string[]): string =>
  body
    .map((raw) => {
      if (raw.startsWith("```")) {
        const code = raw.replace(/^```[^\n]*\n?/, "").replace(/\n?```\s*$/, "");
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }
      if (raw.startsWith("## ")) return `<h2>${inline(raw.slice(3))}</h2>`;
      if (raw.startsWith("> ")) {
        return `<blockquote><p>${inline(raw.slice(2))}</p></blockquote>`;
      }
      return `<p>${inline(raw)}</p>`;
    })
    .join("\n");

/** Wrap content in a CDATA section, guarding against a literal `]]>`. */
const cdata = (text: string): string =>
  `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/**
 * Build an RSS 2.0 feed document for a locale.
 *
 * @param locale - `"tr"` or `"en"`.
 * @returns The complete feed XML.
 */
const buildFeed = (locale: "tr" | "en"): string => {
  const { messages, file } = locales[locale];

  const items = posts
    .map((post) => {
      const content = messages.blog.posts[post.slug];
      if (!content) return "";
      const url = `${SITE}/blog/${post.slug}`;
      const pubDate = new Date(`${post.date}T09:00:00Z`).toUTCString();
      const categories = post.tags
        .map((tag) => `      <category>${escapeHtml(tag)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeHtml(content.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${cdata(content.excerpt)}</description>
      <content:encoded>${cdata(bodyToHtml(content.body))}</content:encoded>
${categories}
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PlayerBerry — Blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/${file}" rel="self" type="application/rss+xml" />
    <description>${escapeHtml(messages.blog.lead)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
};

/**
 * Vite plugin that publishes the blog as static RSS 2.0 feeds.
 *
 * Emits `rss.xml` (Turkish) and `rss-en.xml` (English) into the build output,
 * and serves the same feeds from the dev server so they can be previewed
 * before deploying.
 */
export function rss(): Plugin {
  return {
    name: "playerberry-rss",

    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "rss.xml",
        source: buildFeed("tr"),
      });
      this.emitFile({
        type: "asset",
        fileName: "rss-en.xml",
        source: buildFeed("en"),
      });
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req as { url?: string }).url ?? "";
        const feed =
          url === "/rss.xml" ? "tr" : url === "/rss-en.xml" ? "en" : null;
        if (!feed) return next();
        res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        res.end(buildFeed(feed));
      });
    },
  };
}
