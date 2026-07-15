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
}

/**
 * `v-spotlight` — a pointer-reactive glow directive.
 *
 * While the cursor hovers the bound element, its position is written to two
 * CSS custom properties, `--pb-spot-x` and `--pb-spot-y` (as percentages of
 * the element's box). Stylesheets can then paint a radial highlight anchored
 * to those coordinates, so cards feel alive and follow the pointer.
 *
 * The effect is purely cosmetic, so listeners are never attached for visitors
 * who prefer reduced motion — the card simply falls back to its static hover
 * glow. All listeners are cleaned up in `beforeUnmount`.
 *
 * @example
 * ```vue
 * <div class="uk-card uk-card-default uk-card-hover" v-spotlight>…</div>
 * ```
 */
const spotlight: Directive<SpotlightElement> = {
  mounted(el) {
    if (prefersReducedMotion()) return;

    /** Project the pointer onto the element and expose it as CSS variables. */
    const onMove = (event: PointerEvent): void => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--pb-spot-x", `${x}%`);
      el.style.setProperty("--pb-spot-y", `${y}%`);
    };

    /** Reset to the resting position so the next hover starts cleanly. */
    const onLeave = (): void => {
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
  },
};

export default spotlight;
