import type { Directive } from "vue";

/**
 * Whether the current visitor has asked the operating system to minimise
 * non-essential motion. Decorative effects honour this preference.
 *
 * @returns `true` when `prefers-reduced-motion: reduce` is active.
 */
const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A DOM element augmented with the listeners the directive attaches, so they
 * can be removed again on unmount without leaking memory.
 */
interface SpotlightElement extends HTMLElement {
  /** Pointer-move handler bound during {@link spotlight.mounted}. */
  _pbSpotlightMove?: (event: PointerEvent) => void;
  /** Pointer-leave handler bound during {@link spotlight.mounted}. */
  _pbSpotlightLeave?: () => void;
  /** Pending rAF id (`0` when idle), so moves coalesce to one per frame. */
  _pbSpotlightFrame?: number;
}

/**
 * `v-spotlight` — a pointer-reactive glow directive.
 *
 * While the cursor hovers the bound element, its position is written to two
 * CSS custom properties, `--pb-spot-x` and `--pb-spot-y` (as percentages of
 * the element's box). Stylesheets can then paint a radial highlight anchored
 * to those coordinates, so cards feel alive and follow the pointer.
 *
 * Pointer moves are coalesced through `requestAnimationFrame`: the layout
 * read (`getBoundingClientRect`) and the style writes happen at most once per
 * frame, avoiding forced reflows under rapid pointer movement.
 *
 * The effect is purely cosmetic, so listeners are never attached for visitors
 * who prefer reduced motion — the card simply falls back to its static hover
 * glow. All listeners are cleaned up in `beforeUnmount`.
 *
 * @example
 * ```vue
 * <div class="card" v-spotlight>…</div>
 * ```
 */
const spotlight: Directive<SpotlightElement> = {
  mounted(el) {
    if (prefersReducedMotion()) return;

    /** Latest pointer position; applied on the next animation frame. */
    let lastX = 0;
    let lastY = 0;

    /** Read the element box once per frame and expose the pointer as CSS vars. */
    const apply = (): void => {
      el._pbSpotlightFrame = 0;
      const rect = el.getBoundingClientRect();
      const x = ((lastX - rect.left) / rect.width) * 100;
      const y = ((lastY - rect.top) / rect.height) * 100;
      el.style.setProperty("--pb-spot-x", `${x}%`);
      el.style.setProperty("--pb-spot-y", `${y}%`);
    };

    /** Record the pointer and schedule one frame (if none is pending). */
    const onMove = (event: PointerEvent): void => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!el._pbSpotlightFrame) {
        el._pbSpotlightFrame = requestAnimationFrame(apply);
      }
    };

    /** Reset to the resting position so the next hover starts cleanly. */
    const onLeave = (): void => {
      if (el._pbSpotlightFrame) {
        cancelAnimationFrame(el._pbSpotlightFrame);
        el._pbSpotlightFrame = 0;
      }
      el.style.removeProperty("--pb-spot-x");
      el.style.removeProperty("--pb-spot-y");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el._pbSpotlightMove = onMove;
    el._pbSpotlightLeave = onLeave;
  },

  beforeUnmount(el) {
    if (el._pbSpotlightMove) {
      el.removeEventListener("pointermove", el._pbSpotlightMove);
    }
    if (el._pbSpotlightLeave) {
      el.removeEventListener("pointerleave", el._pbSpotlightLeave);
    }
    if (el._pbSpotlightFrame) cancelAnimationFrame(el._pbSpotlightFrame);
  },
};

export default spotlight;
