import { useI18n } from "vue-i18n";
import { readingMinutes } from "../assets/js/postBlocks";

/** The raw article fields stored under `blog.posts.<slug>` in a locale file. */
interface RawPostContent {
  /** The post's title. */
  title: string;
  /** A short summary shown on cards and the blog index. */
  excerpt: string;
  /** Ordered body blocks (paragraphs, `## ` headings, `> ` quotes, ``` code). */
  body: string[];
}

/** Localised article content for a single blog post, plus derived fields. */
export interface PostContent extends RawPostContent {
  /** Estimated reading time in whole minutes, derived from `body`. */
  minutes: number;
  /**
   * The locale the content was actually resolved from: the active locale, or
   * `"en"` when the active catalogue has no article for the slug. Callers use
   * it to mark fallback content with a `lang` attribute.
   */
  lang: string;
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
        blog?: { posts?: Record<string, RawPostContent> };
      };
      const raw = messages?.blog?.posts?.[slug];
      return raw && { ...raw, minutes: readingMinutes(raw.body), lang: loc };
    };
    return read(locale.value) ?? read("en");
  };

  return { getPost };
}
