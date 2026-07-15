import { useI18n } from "vue-i18n";

/** Localised article content for a single blog post. */
export interface PostContent {
  /** The post's title. */
  title: string;
  /** A short summary shown on cards and the blog index. */
  excerpt: string;
  /** Ordered body blocks (paragraphs, `## ` headings, `> ` quotes, ``` code). */
  body: string[];
}

/**
 * Read blog article content straight from the raw locale messages, bypassing
 * vue-i18n's message compiler.
 *
 * The compiler treats `{`, `}` and `|` as interpolation and plural syntax and
 * rejects anything else, which makes it impossible to embed code snippets in a
 * translated message. Reading the raw message tree instead lets post titles,
 * excerpts and bodies contain arbitrary code. UI chrome (menu labels, the
 * "min read" string, etc.) still goes through the normal `t()` pipeline.
 *
 * @returns A `getPost` helper that resolves a post's content for the active
 *   locale (falling back to English).
 */
export function usePostContent() {
  const { locale, getLocaleMessage } = useI18n();

  /**
   * Resolve a post's raw content for the current locale.
   *
   * @param slug - The post slug (matches the `blog.posts.<slug>` key).
   * @returns The post content, or `undefined` when the slug is unknown.
   */
  const getPost = (slug: string): PostContent | undefined => {
    const read = (loc: string): PostContent | undefined => {
      const messages = getLocaleMessage(loc) as {
        blog?: { posts?: Record<string, PostContent> };
      };
      return messages?.blog?.posts?.[slug];
    };
    return read(locale.value) ?? read("en");
  };

  return { getPost };
}
