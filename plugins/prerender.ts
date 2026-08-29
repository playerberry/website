import type { Plugin, ResolvedConfig } from "vite";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
  /** Source module of the lazily loaded view rendering this route. */
  view?: string;
}

/** One entry of Vite's build manifest (the subset used here). */
interface ManifestChunk {
  file: string;
  imports?: string[];
}

/** Vite's build manifest: source module → emitted chunk. */
type Manifest = Record<string, ManifestChunk>;

/** Lazily loaded views per route path (the home view is in the main chunk). */
const VIEWS: Record<string, string> = {
  "/projects": "src/views/ProjectsView.vue",
  "/blog": "src/views/BlogView.vue",
  "/store": "src/views/StoreView.vue",
  "/about-us": "src/views/AboutUsView.vue",
  "/contact": "src/views/ContactView.vue",
  "/privacy-policy": "src/views/PrivacyView.vue",
  "/cookies-policy": "src/views/CookiesView.vue",
  "/terms-and-conditions": "src/views/TosView.vue",
};

/** Source module of the blog article view. */
const ARTICLE_VIEW = "src/views/BlogPostView.vue";

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
    extra: Partial<Shell> = {},
  ): Shell => ({
    path,
    locale,
    title,
    description,
    homeLabel: t.menu.home,
    imageAlt: t.meta.ogAlt,
    breadcrumb: path === "/" ? undefined : [{ name: title, path }],
    file: fileFor(path),
    view: VIEWS[path],
    ...extra,
  });

  const articleLocale = ARTICLE_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const articles = posts.map((post) => {
    const slug = post.slug as keyof typeof en.blog.posts;
    const content = catalogues[articleLocale].blog.posts[slug];
    const path = `/blog/${post.slug}`;
    return page(path, content.title, content.excerpt, {
      view: ARTICLE_VIEW,
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
 * Emitted files a source module needs at runtime: its own chunk plus every
 * chunk it statically imports, transitively (in load order, deduplicated).
 *
 * @param manifest - Vite's build manifest.
 * @param source - Source module path (a manifest key).
 * @returns Chunk paths relative to the output directory.
 */
const chunksFor = (manifest: Manifest, source: string): string[] => {
  const files: string[] = [];
  const visit = (key: string): void => {
    const entry = manifest[key];
    if (!entry || files.includes(entry.file)) return;
    for (const dep of entry.imports ?? []) visit(dep);
    files.push(entry.file);
  };
  visit(source);
  return files;
};

/**
 * `<link>` hints that shorten a page's critical request chain: the route's
 * lazy view chunk and the language catalogue chunk (both otherwise
 * discovered only after the main bundle runs) plus the font files the
 * language's text needs for its first paint. The main bundle's own imports are already preloaded by
 * Vite's `modulepreload` tags in `index.html`.
 *
 * @param manifest - Vite's build manifest.
 * @param fonts - Font files (relative to the output directory) to preload.
 * @param shell - The page.
 * @returns The `<link>` tags, one per line.
 */
const preloadTags = (
  manifest: Manifest,
  fonts: string[],
  shell: Shell,
): string => {
  // Chunks the entry already loads (and Vite already preloads) are skipped.
  const entry = new Set(chunksFor(manifest, "index.html"));
  const modules = new Set<string>();
  const add = (source: string): void => {
    for (const file of chunksFor(manifest, source)) {
      if (!entry.has(file)) modules.add(file);
    }
  };
  if (shell.view) add(shell.view);
  if (shell.locale !== DEFAULT_LOCALE) add(`src/locales/${shell.locale}.json`);
  return [
    ...fonts.map(
      (font) =>
        `<link rel="preload" as="font" type="font/woff2" href="/${font}" crossorigin />`,
    ),
    ...[...modules].map(
      (file) => `<link rel="modulepreload" href="/${file}" />`,
    ),
  ].join("\n");
};

/**
 * Swap the marked head block of the built `index.html` for a page's own tags
 * (SEO metadata followed by the page's preload hints) and set `<html lang>`
 * to the page's language.
 *
 * @param template - The built `index.html`.
 * @param shell - The page.
 * @param preloads - Preload `<link>` tags for the page.
 * @returns The page shell HTML.
 */
const renderShell = (
  template: string,
  shell: Shell,
  preloads: string,
): string => {
  const start = template.indexOf(START);
  const end = template.indexOf(END);
  if (start < 0 || end < 0) {
    throw new Error(`index.html is missing the ${START} / ${END} markers`);
  }
  const head = [renderHead(buildHead(shell)), preloads]
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  return `${template.slice(0, start + START.length)}\n${head}\n    ${template.slice(end)}`.replace(
    /<html lang="[^"]*"/,
    `<html lang="${shell.locale}"`,
  );
};

/**
 * Faces worth preloading (file-name prefixes): the body and display fonts
 * that set the first paint's text. The mono face only dresses small labels,
 * so it can arrive later without delaying the largest contentful paint.
 */
const FONT_FAMILIES = ["inter", "space-grotesk"];

/**
 * Unicode subsets a language's text is set in — the font files worth
 * preloading for that language's shells. Every language uses the latin
 * files (Latin script, digits, punctuation); Turkish needs the extended
 * Latin block for ş/ğ/ı, Russian and Greek their own scripts. CJK glyphs
 * come from system fonts, so those locales preload only the latin files.
 */
const FONT_SUBSETS: Record<Locale, string[]> = {
  en: ["latin"],
  tr: ["latin", "latin-ext"],
  es: ["latin"],
  fr: ["latin"],
  de: ["latin"],
  it: ["latin"],
  ru: ["latin", "cyrillic"],
  el: ["latin", "greek"],
  ja: ["latin"],
  ko: ["latin"],
  zh: ["latin"],
};

/**
 * Font files a language's pages should preload, from the emitted assets.
 *
 * @param assets - File names in the `assets/` output directory.
 * @param locale - The shells' language.
 * @returns Paths relative to the output directory.
 */
const fontsFor = (assets: string[], locale: Locale): string[] =>
  FONT_SUBSETS[locale].flatMap((subset) =>
    FONT_FAMILIES.flatMap((family) =>
      assets
        .filter((f) => f.startsWith(`${family}-${subset}-wght-normal`))
        .map((f) => `assets/${f}`),
    ),
  );

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
      const manifestPath = join(outDir, ".vite", "manifest.json");
      const manifest: Manifest = existsSync(manifestPath)
        ? JSON.parse(readFileSync(manifestPath, "utf8"))
        : {};
      const assetsDir = join(outDir, "assets");
      const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
      let count = 0;
      // English last: its home shell overwrites index.html itself, so the
      // template must be read before any language writes.
      const order = [
        ...SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE),
        DEFAULT_LOCALE,
      ];
      for (const locale of order) {
        const fonts = fontsFor(assets, locale);
        for (const shell of pagesFor(locale)) {
          const target = join(outDir, shell.file);
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(
            target,
            renderShell(template, shell, preloadTags(manifest, fonts, shell)),
          );
          count += 1;
        }
      }
      // The manifest only served this step; keep it out of the deploy.
      rmSync(join(outDir, ".vite"), { recursive: true, force: true });
      config.logger.info(
        `prerender: wrote ${count} page shells in ${order.length} languages`,
      );
    },
  };
}
