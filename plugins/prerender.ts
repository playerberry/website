import type { Plugin, ResolvedConfig } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { posts } from "../src/data/posts.ts";
import en from "../src/locales/en.json" with { type: "json" };
import { DEFAULT_LOCALE } from "../src/assets/js/locales.ts";
import {
  ARTICLE_LOCALES,
  LEGAL_LOCALES,
  buildHead,
  renderHead,
  type HeadInput,
} from "../src/assets/js/seo.ts";

/** Markers delimiting the per-page head block in `index.html`. */
const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";

/**
 * Head inputs for every indexable route, in the default language (what a
 * crawler without JavaScript, or a social scraper, gets to see). The runtime
 * (`meta.ts`) re-applies the same model for the visitor's language.
 */
const pages = (): Array<HeadInput & { file: string }> => {
  const page = (
    path: string,
    title: string,
    description: string,
    extra: Partial<HeadInput> = {},
  ): HeadInput & { file: string } => ({
    path,
    locale: DEFAULT_LOCALE,
    title,
    description,
    homeLabel: en.menu.home,
    imageAlt: en.meta.ogAlt,
    breadcrumb: path === "/" ? undefined : [{ name: title, path }],
    file: path === "/" ? "index.html" : `${path.slice(1)}.html`,
    ...extra,
  });

  const articles = posts.map((post) => {
    const content = en.blog.posts[post.slug as keyof typeof en.blog.posts];
    const path = `/blog/${post.slug}`;
    return page(path, content.title, content.excerpt, {
      contentLocales: ARTICLE_LOCALES,
      breadcrumb: [
        { name: en.menu.blog, path: "/blog" },
        { name: content.title, path },
      ],
      article: {
        datePublished: post.date,
        tags: post.tags,
        inLanguage: DEFAULT_LOCALE,
      },
    });
  });

  return [
    page("/", en.meta.titles.home, en.meta.home, { brand: false }),
    page("/projects", en.meta.titles.projects, en.meta.projects),
    page("/blog", en.meta.titles.blog, en.meta.blog),
    page("/store", en.meta.titles.store, en.meta.store),
    page("/about-us", en.meta.titles.about, en.meta.about),
    page("/contact", en.meta.titles.contact, en.meta.contact),
    page("/privacy-policy", en.footer.privacy, en.meta.legal, {
      contentLocales: LEGAL_LOCALES,
    }),
    page("/cookies-policy", en.footer.cookies, en.meta.legal, {
      contentLocales: LEGAL_LOCALES,
    }),
    page("/terms-and-conditions", en.footer.terms, en.meta.legal, {
      contentLocales: LEGAL_LOCALES,
    }),
    ...articles,
  ];
};

/**
 * Swap the marked head block of the built `index.html` for a page's own tags.
 *
 * @param template - The built `index.html`.
 * @param input - The page's head input.
 * @returns The page shell HTML.
 */
const renderShell = (template: string, input: HeadInput): string => {
  const start = template.indexOf(START);
  const end = template.indexOf(END);
  if (start < 0 || end < 0) {
    throw new Error(`index.html is missing the ${START} / ${END} markers`);
  }
  const head = renderHead(buildHead(input))
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  return `${template.slice(0, start + START.length)}\n${head}\n    ${template.slice(end)}`;
};

/**
 * Vite plugin that emits one static HTML shell per indexable route after the
 * build: `dist/projects.html`, `dist/blog/<slug>.html`, …, each a copy of the
 * built `index.html` with its own title, description, canonical, hreflang and
 * structured data. GitHub Pages serves `/projects` from `projects.html`, so
 * crawlers get a `200` with the right metadata instead of the `404.html`
 * redirect dance reserved for unknown paths — and social scrapers, which do
 * not run JavaScript, see per-page titles and descriptions.
 */
export function prerender(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "playerberry-prerender",
    apply: "build",

    configResolved(resolved) {
      config = resolved;
    },

    closeBundle(error) {
      // A failed build has no index.html to copy; let the real error surface.
      if (error) return;
      const outDir = resolve(config.root, config.build.outDir);
      const template = readFileSync(join(outDir, "index.html"), "utf8");
      let count = 0;
      for (const { file, ...input } of pages()) {
        const target = join(outDir, file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, renderShell(template, input));
        count += 1;
      }
      config.logger.info(`prerender: wrote ${count} page shells`);
    },
  };
}
