import type { Plugin } from "vite";
import { posts } from "../src/data/posts.ts";
import { localizedUrl } from "../src/assets/js/seo.ts";
import { parseBlocks, type InlineSpan } from "../src/assets/js/postBlocks.ts";
import trMessages from "../src/locales/tr.json" with { type: "json" };
import enMessages from "../src/locales/en.json" with { type: "json" };
import esMessages from "../src/locales/es.json" with { type: "json" };

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

/** A feed locale: its catalogue, output file and native-language label. */
interface FeedLocale {
  messages: FeedMessages;
  /** Output file name under the site root. */
  file: string;
  /** Native language name shown in the channel title (matches index.html). */
  label: string;
}

const locales: Record<string, FeedLocale> = {
  tr: {
    messages: trMessages as unknown as FeedMessages,
    file: "rss.xml",
    label: "Türkçe",
  },
  en: {
    messages: enMessages as unknown as FeedMessages,
    file: "rss-en.xml",
    label: "English",
  },
  es: {
    messages: esMessages as unknown as FeedMessages,
    file: "rss-es.xml",
    label: "Español",
  },
};

/** Escape a string for safe inclusion in XML/HTML text and attributes. */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Render a line's spans: inline `code` spans wrapped, everything escaped. */
const inline = (spans: readonly InlineSpan[]): string =>
  spans
    .map((span) =>
      span.code
        ? `<code>${escapeHtml(span.text)}</code>`
        : escapeHtml(span.text),
    )
    .join("");

/**
 * Convert a post body into a self-contained HTML fragment for
 * `content:encoded`, using the same block parser as the site so the feed
 * cannot drift from the rendered article. Code blocks keep their fence
 * language as a `language-*` class (the convention feed readers and
 * highlighters understand).
 */
const bodyToHtml = (body: string[]): string =>
  parseBlocks(body)
    .map((block) => {
      switch (block.kind) {
        case "code": {
          const cls = block.lang
            ? ` class="language-${escapeHtml(block.lang)}"`
            : "";
          return `<pre><code${cls}>${escapeHtml(block.code)}</code></pre>`;
        }
        case "h2":
          return `<h2>${inline(block.spans)}</h2>`;
        case "quote":
          return `<blockquote><p>${inline(block.spans)}</p></blockquote>`;
        default:
          return `<p>${inline(block.spans)}</p>`;
      }
    })
    .join("\n");

/** Wrap content in a CDATA section, guarding against a literal `]]>`. */
const cdata = (text: string): string =>
  `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/**
 * Build an RSS 2.0 feed document for a locale.
 *
 * @param locale - `"tr"`, `"en"` or `"es"`.
 * @returns The complete feed XML.
 */
const buildFeed = (locale: "tr" | "en" | "es"): string => {
  const { messages, file, label } = locales[locale];

  const items = posts
    .map((post) => {
      const content = messages.blog.posts[post.slug];
      if (!content) return "";
      const url = localizedUrl(`/blog/${post.slug}`, locale);
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
    <title>PlayerBerry — Blog (${label})</title>
    <link>${localizedUrl("/blog", locale)}</link>
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
 * Emits `rss.xml` (Turkish), `rss-en.xml` (English) and `rss-es.xml`
 * (Spanish) into the build output, and serves the same feeds from the dev
 * server so they can be previewed before deploying.
 */
export function rss(): Plugin {
  return {
    name: "playerberry-rss",

    generateBundle() {
      for (const [locale, { file }] of Object.entries(locales)) {
        this.emitFile({
          type: "asset",
          fileName: file,
          source: buildFeed(locale as "tr" | "en" | "es"),
        });
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req as { url?: string }).url ?? "";
        const feed = Object.entries(locales).find(
          ([, { file }]) => url === `/${file}`,
        )?.[0] as "tr" | "en" | "es" | undefined;
        if (!feed) return next();
        res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        res.end(buildFeed(feed));
      });
    },
  };
}
