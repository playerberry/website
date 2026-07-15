/**
 * A blog post's metadata. The title, excerpt and body paragraphs are localised
 * in the locale files under `blog.posts.<slug>` and resolved by `slug`.
 *
 * Body paragraphs use a tiny inline convention so long reads can be structured
 * while the content stays a plain array of strings: a leading `## ` marks a
 * section heading and a leading `> ` marks a pull quote (see BlogPostView).
 */
export interface Post {
  /** URL slug and i18n key suffix (e.g. `/blog/<slug>`). */
  slug: string;
  /** Publication date as an ISO 8601 string; the array is ordered newest-first. */
  date: string;
  /** Estimated reading time in minutes. */
  minutes: number;
  /** Topic tags shown as chips. */
  tags: string[];
  /** CSS `background-image` gradient used for the post cover. */
  gradient: string;
}

/**
 * Blog content, newest first. Titles, excerpts and bodies live in the locale
 * files under `blog.posts.<slug>`; this array holds only the metadata.
 */
export const posts: Post[] = [
  {
    slug: "swift-concurrency",
    date: "2026-07-14",
    minutes: 9,
    tags: ["Swift", "Concurrency"],
    gradient: "linear-gradient(135deg, #ff3d77, #ffa63d)",
  },
  {
    slug: "modern-cpp-bellek",
    date: "2026-07-12",
    minutes: 9,
    tags: ["C++", "Memory"],
    gradient: "linear-gradient(135deg, #338aff, #8b5cf6)",
  },
  {
    slug: "c-isaretciler",
    date: "2026-07-11",
    minutes: 7,
    tags: ["C", "Systems"],
    gradient: "linear-gradient(135deg, #3cf0c5, #338aff)",
  },
  {
    slug: "llm-urun-entegrasyonu",
    date: "2026-07-10",
    minutes: 12,
    tags: ["AI", "Product"],
    gradient: "linear-gradient(135deg, #8b5cf6, #ff3d77)",
  },
  {
    slug: "core-web-vitals",
    date: "2026-07-03",
    minutes: 9,
    tags: ["Performance", "UX"],
    gradient: "linear-gradient(135deg, #ffa63d, #3cf0c5)",
  },
  {
    slug: "typescript-tip-guvenligi",
    date: "2026-06-27",
    minutes: 10,
    tags: ["TypeScript", "Architecture"],
    gradient: "linear-gradient(135deg, #338aff, #8b5cf6)",
  },
  {
    slug: "erisilebilirlik-varsayilan",
    date: "2026-06-22",
    minutes: 9,
    tags: ["Accessibility", "Frontend"],
    gradient: "linear-gradient(135deg, #3cf0c5, #ffa63d)",
  },
  {
    slug: "vue-3-5-performans",
    date: "2026-06-18",
    minutes: 8,
    tags: ["Vue", "Performance"],
    gradient: "linear-gradient(135deg, #3cf0c5, #338aff)",
  },
  {
    slug: "tasarim-sistemi-kurmak",
    date: "2026-05-02",
    minutes: 9,
    tags: ["Design Systems", "Less"],
    gradient: "linear-gradient(135deg, #ff3d77, #8b5cf6)",
  },
  {
    slug: "swiftui-ile-native",
    date: "2026-03-27",
    minutes: 7,
    tags: ["Swift", "iOS"],
    gradient: "linear-gradient(135deg, #ffa63d, #ff3d77)",
  },
  {
    slug: "monorepo-mimarisi",
    date: "2026-02-10",
    minutes: 9,
    tags: ["Architecture", "Tooling"],
    gradient: "linear-gradient(135deg, #8b5cf6, #338aff)",
  },
];
