import { describe, expect, it } from "vitest";
import {
  ARTICLE_LOCALES,
  SITE,
  buildHead,
  localeOfPath,
  localePath,
  localizedUrl,
  normalizePath,
  renderHead,
  stripLocale,
} from "./seo";
import { SUPPORTED_LOCALES, feedPathFor } from "./locales";

describe("normalizePath", () => {
  it("keeps the home path", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("/");
  });

  it("strips trailing slashes, queries and hashes", () => {
    expect(normalizePath("/projects/")).toBe("/projects");
    expect(normalizePath("/blog/slug?lang=tr#top")).toBe("/blog/slug");
  });
});

describe("localePath", () => {
  it("uses the clean path for the default locale", () => {
    expect(localePath("/projects", "en")).toBe("/projects");
    expect(localePath("/", "en")).toBe("/");
    expect(localePath("/tr/projects", "en")).toBe("/projects");
  });

  it("prefixes other locales and keeps the home as a directory", () => {
    expect(localePath("/projects/", "tr")).toBe("/tr/projects");
    expect(localePath("/", "tr")).toBe("/tr/");
    expect(localePath("/de/blog/x", "tr")).toBe("/tr/blog/x");
  });
});

describe("localeOfPath / stripLocale", () => {
  it("detects and strips a supported prefix only", () => {
    expect(localeOfPath("/tr/projects")).toBe("tr");
    expect(localeOfPath("/tr")).toBe("tr");
    expect(localeOfPath("/training")).toBeNull();
    expect(localeOfPath("/projects")).toBeNull();
    expect(stripLocale("/tr/projects")).toBe("/projects");
    expect(stripLocale("/tr/")).toBe("/");
    expect(stripLocale("/tr")).toBe("/");
    expect(stripLocale("/training")).toBe("/training");
  });
});

describe("localizedUrl", () => {
  it("builds absolute language URLs", () => {
    expect(localizedUrl("/projects", "en")).toBe(`${SITE}/projects`);
    expect(localizedUrl("/", "en")).toBe(`${SITE}/`);
    expect(localizedUrl("/projects/", "tr")).toBe(`${SITE}/tr/projects`);
    expect(localizedUrl("/", "tr")).toBe(`${SITE}/tr/`);
  });
});

describe("buildHead", () => {
  it("appends the brand to titles unless told not to", () => {
    expect(buildHead({ path: "/x", locale: "en", title: "Blog" }).title).toBe(
      "Blog — PlayerBerry",
    );
    expect(
      buildHead({ path: "/", locale: "en", title: "Full", brand: false }).title,
    ).toBe("Full");
    expect(buildHead({ path: "/", locale: "en" }).title).toBe("PlayerBerry");
  });

  it("lists every locale plus x-default and makes the page self-canonical", () => {
    const head = buildHead({ path: "/store", locale: "tr" });
    expect(head.canonical).toBe(`${SITE}/tr/store`);
    expect(head.alternates).toHaveLength(SUPPORTED_LOCALES.length + 1);
    expect(head.alternates[head.alternates.length - 1]).toEqual({
      hreflang: "x-default",
      href: `${SITE}/store`,
    });
    expect(head.ogLocale).toBe("tr_TR");
    expect(head.ogLocaleAlternates).not.toContain("tr_TR");
    expect(head.ogLocaleAlternates).toContain("en_US");
    expect(head.robots).toBe("index,follow,max-image-preview:large");
    expect(head.ogType).toBe("website");
  });

  it("falls back to the default locale when the content is not localised", () => {
    const head = buildHead({
      path: "/blog/post",
      locale: "de",
      contentLocales: ARTICLE_LOCALES,
    });
    expect(head.canonical).toBe(`${SITE}/blog/post`);
    expect(head.ogLocale).toBe("en_US");
    expect(head.alternates.map((a) => a.hreflang)).toEqual([
      "tr",
      "en",
      "es",
      "x-default",
    ]);
  });

  it("uses the page's primary language when the default has no content", () => {
    const head = buildHead({
      path: "/privacy-policy",
      locale: "de",
      contentLocales: ["tr"],
    });
    expect(head.canonical).toBe(`${SITE}/tr/privacy-policy`);
    expect(head.ogLocale).toBe("tr_TR");
    expect(head.ogLocaleAlternates).toEqual([]);
    expect(head.alternates).toEqual([
      { hreflang: "tr", href: `${SITE}/tr/privacy-policy` },
      { hreflang: "x-default", href: `${SITE}/tr/privacy-policy` },
    ]);
  });

  it("marks noindex pages and drops their alternates and breadcrumbs", () => {
    const head = buildHead({
      path: "/nope",
      locale: "en",
      noindex: true,
      breadcrumb: [{ name: "Nope", path: "/nope" }],
    });
    expect(head.robots).toBe("noindex,follow");
    expect(head.alternates).toEqual([]);
    expect(head.jsonLd).toEqual([]);
  });

  it("emits breadcrumb and article structured data", () => {
    const head = buildHead({
      path: "/blog/post",
      locale: "tr",
      title: "Başlık",
      description: "Özet",
      homeLabel: "Ana Sayfa",
      breadcrumb: [
        { name: "Blog", path: "/blog" },
        { name: "Başlık", path: "/blog/post" },
      ],
      contentLocales: ARTICLE_LOCALES,
      article: { datePublished: "2026-07-14", tags: ["Swift"], inLanguage: "tr" },
    });
    expect(head.ogType).toBe("article");
    const [crumbs, post] = head.jsonLd as Array<Record<string, unknown>>;
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    const items = crumbs.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0].item).toBe(`${SITE}/tr/`);
    expect(items[2].item).toBe(`${SITE}/tr/blog/post`);
    expect(post["@type"]).toBe("BlogPosting");
    expect(post.headline).toBe("Başlık");
    expect(post.datePublished).toBe("2026-07-14");
    expect(post.keywords).toBe("Swift");
  });

  it("keeps ARTICLE_LOCALES in step with the feed mapping", () => {
    // Locales with their own articles have their own feed; the rest share the
    // English feed.
    for (const locale of SUPPORTED_LOCALES) {
      const own = ARTICLE_LOCALES.includes(locale);
      expect(feedPathFor(locale) !== feedPathFor("en") || locale === "en").toBe(
        own,
      );
    }
  });
});

describe("renderHead", () => {
  it("renders escaped tags and structured data", () => {
    const html = renderHead(
      buildHead({
        path: "/x",
        locale: "en",
        title: 'A "quoted" <title>',
        description: "Desc & more",
        imageAlt: "Alt",
        breadcrumb: [{ name: "X", path: "/x" }],
      }),
    );
    expect(html).toContain(
      "<title>A &quot;quoted&quot; &lt;title&gt; — PlayerBerry</title>",
    );
    expect(html).toContain('<meta name="description" content="Desc &amp; more" />');
    expect(html).toContain(`<link rel="canonical" href="${SITE}/x" />`);
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('<meta property="og:image:alt" content="Alt" />');
    expect(html).toContain('<script type="application/ld+json" id="pb-ld-page">');
    expect(html).not.toContain("</script></script>");
  });

  it("neutralises </script> inside structured data", () => {
    const html = renderHead(
      buildHead({
        path: "/x",
        locale: "en",
        title: "x</script><img src=x onerror=1>",
        breadcrumb: [{ name: "</script>", path: "/x" }],
      }),
    );
    // Only the JSON-LD block's own closing tag may appear.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const json = html.match(/id="pb-ld-page">(.*)<\/script>/)?.[1] ?? "";
    expect(json).toContain("\\u003c/script>");
    expect(JSON.parse(json)[0].itemListElement[1].name).toBe("</script>");
  });

  it("omits optional tags when absent", () => {
    const html = renderHead(buildHead({ path: "/", locale: "en", noindex: true }));
    expect(html).not.toContain('name="description"');
    expect(html).not.toContain("hreflang");
    expect(html).not.toContain("ld+json");
    expect(html).toContain('<meta name="robots" content="noindex,follow" />');
  });
});
