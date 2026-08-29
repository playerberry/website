/**
 * A blog post's metadata. The title, excerpt and body blocks are localised in
 * the locale files under `blog.posts.<slug>` and resolved by `slug` (see
 * `usePostContent`, which also derives the reading time from the body).
 *
 * Body blocks use a tiny inline convention so long reads can be structured
 * while the content stays a plain array of strings: a leading `## ` marks a
 * section heading, a leading `> ` marks a pull quote, a ```` ``` ````-fenced
 * string (optionally with a language tag after the opening fence) is a code
 * block, and text wrapped in single backticks inside headings, quotes and
 * paragraphs becomes inline code. The convention is parsed by
 * `src/assets/js/postBlocks.ts` and rendered by BlogPostView.
 */
export interface Post {
  /** URL slug and i18n key suffix (e.g. `/blog/<slug>`). */
  slug: string;
  /** Publication date as an ISO 8601 string; the array is ordered newest-first. */
  date: string;
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
    tags: ["Swift", "Concurrency"],
    gradient: "linear-gradient(135deg, #ff3d77, #ffa63d)",
  },
  {
    slug: "modern-cpp-bellek",
    date: "2026-07-12",
    tags: ["C++", "Memory"],
    gradient: "linear-gradient(135deg, #338aff, #8b5cf6)",
  },
  {
    slug: "c-isaretciler",
    date: "2026-07-11",
    tags: ["C", "Systems"],
    gradient: "linear-gradient(135deg, #3cf0c5, #338aff)",
  },
  {
    slug: "llm-urun-entegrasyonu",
    date: "2026-07-10",
    tags: ["AI", "Product"],
    gradient: "linear-gradient(135deg, #8b5cf6, #ff3d77)",
  },
  {
    slug: "core-web-vitals",
    date: "2026-07-03",
    tags: ["Performance", "UX"],
    gradient: "linear-gradient(135deg, #ffa63d, #3cf0c5)",
  },
  {
    slug: "typescript-tip-guvenligi",
    date: "2026-06-27",
    tags: ["TypeScript", "Architecture"],
    gradient: "linear-gradient(135deg, #338aff, #8b5cf6)",
  },
  {
    slug: "erisilebilirlik-varsayilan",
    date: "2026-06-22",
    tags: ["Accessibility", "Frontend"],
    gradient: "linear-gradient(135deg, #3cf0c5, #ffa63d)",
  },
  {
    slug: "vue-3-5-performans",
    date: "2026-06-18",
    tags: ["Vue", "Performance"],
    gradient: "linear-gradient(135deg, #3cf0c5, #338aff)",
  },
  {
    slug: "tasarim-sistemi-kurmak",
    date: "2026-05-02",
    tags: ["Design Systems", "Less"],
    gradient: "linear-gradient(135deg, #ff3d77, #8b5cf6)",
  },
  {
    slug: "swiftui-ile-native",
    date: "2026-03-27",
    tags: ["Swift", "iOS"],
    gradient: "linear-gradient(135deg, #ffa63d, #ff3d77)",
  },
  {
    slug: "monorepo-mimarisi",
    date: "2026-02-10",
    tags: ["Architecture", "Tooling"],
    gradient: "linear-gradient(135deg, #8b5cf6, #338aff)",
  },
];
