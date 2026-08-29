import type { Plugin, ResolvedConfig } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { posts } from "../src/data/posts.ts";
import en from "../src/locales/en.json" with { type: "json" };
import tr from "../src/locales/tr.json" with { type: "json" };
import es from "../src/locales/es.json" with { type: "json" };
import fr from "../src/locales/fr.json" with { type: "json" };
import de from "../src/locales/de.json" with { type: "json" };
import ru from "../src/locales/ru.json" with { type: "json" };
import ko from "../src/locales/ko.json" with { type: "json" };
import it from "../src/locales/it.json" with { type: "json" };
import el from "../src/locales/el.json" with { type: "json" };
import ja from "../src/locales/ja.json" with { type: "json" };
import zh from "../src/locales/zh.json" with { type: "json" };
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
} from "../src/assets/js/locales.ts";
import {
  ARTICLE_LOCALES,
  LEGAL_LOCALES,
  buildHead,
  localePath,
  renderHead,
  type HeadInput,
} from "../src/assets/js/seo.ts";

/** Markers delimiting the per-page head block in `index.html`. */
const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";

/** The slice of a catalogue the shells need (English has every key). */
type Catalogue = typeof en;

/** Every locale catalogue, keyed by locale. */
const catalogues: Record<Locale, Catalogue> = {
  en,
  tr,
  es,
  fr: fr as unknown as Catalogue,
  de: de as unknown as Catalogue,
  ru: ru as unknown as Catalogue,
  ko: ko as unknown as Catalogue,
  it: it as unknown as Catalogue,
  el: el as unknown as Catalogue,
  ja: ja as unknown as Catalogue,
  zh: zh as unknown as Catalogue,
};

/** A shell to write: the head input plus its output file. */
interface Shell extends HeadInput {
  file: string;
}

/**
 * Head inputs for every indexable route in one language — what a crawler
 * without JavaScript, or a social scraper, gets to see at that language's
 * URL. The runtime (`meta.ts`) re-applies the same model once the app boots.
 *
 * Blog articles exist in {@link ARTICLE_LOCALES} only; other languages get a
 * shell for their URL too (in-app links point there) whose metadata, like the
 * runtime, describes the English article and canonicalises to it.
 *
 * @param locale - The language of the shells.
 * @returns The shells for that language.
 */
const pagesFor = (locale: Locale): Shell[] => {
  const t = catalogues[locale];
  const fileFor = (path: string): string => {
    const localised = localePath(path, locale);
    return localised.endsWith("/")
      ? `${localised.slice(1)}index.html`
      : `${localised.slice(1)}.html`;
  };
  const page = (
    path: string,
    title: string,
    description: string,
    extra: Partial<HeadInput> = {},
  ): Shell => ({
    path,
    locale,
    title,
    description,
    homeLabel: t.menu.home,
    imageAlt: t.meta.ogAlt,
    breadcrumb: path === "/" ? undefined : [{ name: title, path }],
    file: fileFor(path),
    ...extra,
  });

  const articleLocale = ARTICLE_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const articles = posts.map((post) => {
    const slug = post.slug as keyof typeof en.blog.posts;
    const content = catalogues[articleLocale].blog.posts[slug];
    const path = `/blog/${post.slug}`;
    return page(path, content.title, content.excerpt, {
      contentLocales: ARTICLE_LOCALES,
      breadcrumb: [
        { name: t.menu.blog, path: "/blog" },
        { name: content.title, path },
      ],
      article: {
        datePublished: post.date,
        tags: post.tags,
        inLanguage: articleLocale,
      },
    });
  });

  const legal = { contentLocales: LEGAL_LOCALES };

  return [
    page("/", t.meta.titles.home, t.meta.home, { brand: false }),
    page("/projects", t.meta.titles.projects, t.meta.projects),
    page("/blog", t.meta.titles.blog, t.meta.blog),
    page("/store", t.meta.titles.store, t.meta.store),
    page("/about-us", t.meta.titles.about, t.meta.about),
    page("/contact", t.meta.titles.contact, t.meta.contact),
    page("/privacy-policy", t.footer.privacy, t.meta.legal, legal),
    page("/cookies-policy", t.footer.cookies, t.meta.legal, legal),
    page("/terms-and-conditions", t.footer.terms, t.meta.legal, legal),
    ...articles,
  ];
};

/**
 * Swap the marked head block of the built `index.html` for a page's own tags
 * and set `<html lang>` to the page's language.
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
  return `${template.slice(0, start + START.length)}\n${head}\n    ${template.slice(end)}`.replace(
    /<html lang="[^"]*"/,
    `<html lang="${input.locale}"`,
  );
};

/**
 * Vite plugin that emits one static HTML shell per indexable route and
 * language after the build: `dist/projects.html`, `dist/tr/projects.html`,
 * `dist/tr/index.html`, `dist/blog/<slug>.html`, …, each a copy of the built
 * `index.html` with its own language, title, description, canonical,
 * hreflang and structured data. GitHub Pages serves `/tr/projects` from
 * `tr/projects.html` (and `/tr/` from `tr/index.html`), so crawlers get a
 * `200` with the right metadata instead of the `404.html` redirect dance
 * reserved for unknown paths — and social scrapers, which do not run
 * JavaScript, see per-page, per-language titles and descriptions.
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
      // English last: its home shell overwrites index.html itself, so the
      // template must be read before any language writes.
      const order = [
        ...SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE),
        DEFAULT_LOCALE,
      ];
      for (const locale of order) {
        for (const { file, ...input } of pagesFor(locale)) {
          const target = join(outDir, file);
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, renderShell(template, input));
          count += 1;
        }
      }
      config.logger.info(
        `prerender: wrote ${count} page shells in ${order.length} languages`,
      );
    },
  };
}
