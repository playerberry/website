import type { Directive } from "vue";

/**
 * `v-reveal` — fade-and-rise an element into view the first time it scrolls
 * into the viewport.
 *
 * The directive adds the `reveal` class (hidden, translated down — see
 * `assets/css/main.css`) and swaps in `is-visible` once an
 * IntersectionObserver reports the element on screen; the CSS transition
 * does the rest, so the work is one class toggle per element. Once the
 * entrance has played, both classes are removed again so the element's own
 * transitions (e.g. a card's hover lift) take over untouched. An optional
 * numeric value sets a delay in milliseconds (`v-reveal="120"`) for
 * staggering siblings.
 *
 * Visitors who prefer reduced motion, and browsers without
 * IntersectionObserver, see everything immediately.
 *
 * @example
 * ```vue
 * <div v-for="(item, i) in items" :key="item.id" v-reveal="i * 90">…</div>
 * ```
 */

/** Longest possible entrance (transition + stagger) before the classes go. */
const MAX_ENTRANCE_MS = 2500;

/** One shared observer for every revealed element on the page. */
let observer: IntersectionObserver | null = null;

/**
 * Play the entrance and hand the element back to its own styles afterwards.
 *
 * @param el - The element to reveal.
 */
const show = (el: HTMLElement): void => {
  el.classList.add("is-visible");
  let done = false;
  const finish = (): void => {
    if (done) return;
    done = true;
    el.removeEventListener("transitionend", finish);
    el.classList.remove("reveal", "is-visible");
    el.style.removeProperty("--reveal-delay");
  };
  el.addEventListener("transitionend", finish);
  // Safety net for a transition that never fires (hidden tab, display toggle).
  window.setTimeout(finish, MAX_ENTRANCE_MS);
};

/**
 * Lazily create the shared observer.
 *
 * @returns The observer, or `null` when the API is unavailable.
 */
const getObserver = (): IntersectionObserver | null => {
  if (observer) return observer;
  if (typeof IntersectionObserver === "undefined") return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target as HTMLElement);
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  return observer;
};

const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add("reveal");
    if (binding.value) {
      el.style.setProperty("--reveal-delay", `${binding.value}ms`);
    }
    const io = getObserver();
    if (
      !io ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.remove("reveal");
      el.style.removeProperty("--reveal-delay");
      return;
    }
    io.observe(el);
  },

  unmounted(el) {
    observer?.unobserve(el);
  },
};

export default reveal;
