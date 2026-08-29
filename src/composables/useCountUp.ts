import { onMounted, onUnmounted, ref, watch, type Ref } from "vue";

/**
 * Animate a statistic ("40+", "%99,9", "8+") from zero to its value the first
 * time its element scrolls into view.
 *
 * The numeric part is found inside the localised string and counted up over
 * ~1.4 s with an ease-out curve; every other character (prefix, suffix,
 * decimal separator) is preserved, so "%99,9" counts "%0,0 … %99,9". Values
 * without a number, and reduced-motion visitors, get the final text at once.
 *
 * @param value - The localised statistic (reactive; a language switch
 *   restarts with the new text).
 * @param target - The element to watch for visibility.
 * @returns The text to render.
 */
export function useCountUp(
  value: Ref<string>,
  target: Ref<HTMLElement | null>,
): Ref<string> {
  const text = ref(value.value);
  let frame = 0;
  let observer: IntersectionObserver | null = null;

  /** Split the value into prefix, number (with its separator) and suffix. */
  const parse = (
    raw: string,
  ): { prefix: string; number: number; decimals: number; separator: string; suffix: string } | null => {
    const match = /^(.*?)(\d+)(?:([.,])(\d+))?(.*)$/.exec(raw);
    if (!match) return null;
    const [, prefix, int, separator = "", frac = "", suffix] = match;
    return {
      prefix,
      number: Number(`${int}.${frac || "0"}`),
      decimals: frac.length,
      separator,
      suffix,
    };
  };

  /** Run the count-up for the current value. */
  const play = (): void => {
    if (frame) cancelAnimationFrame(frame);
    const parts = parse(value.value);
    if (!parts || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      text.value = value.value;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const current = parts.number * eased;
      const fixed = current.toFixed(parts.decimals);
      const [int, frac] = fixed.split(".");
      text.value = `${parts.prefix}${int}${parts.decimals ? parts.separator + frac : ""}${parts.suffix}`;
      frame = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    frame = requestAnimationFrame(tick);
  };

  onMounted(() => {
    if (!target.value || typeof IntersectionObserver === "undefined") {
      text.value = value.value;
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          observer?.disconnect();
          observer = null;
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(target.value);
  });

  // A language switch changes the text: show it directly (no replay).
  watch(value, (next) => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    text.value = next;
  });

  onUnmounted(() => {
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });

  return text;
}
