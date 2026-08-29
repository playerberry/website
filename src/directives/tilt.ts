import type { Directive } from "vue";

/**
 * `v-tilt` — a subtle 3D tilt that follows the pointer.
 *
 * Writes `--tilt-x` / `--tilt-y` (degrees) on the element as the pointer
 * moves across it; the `.tilt` class in `assets/css/main.css` turns them into
 * a perspective transform and eases back to flat on leave. Moves are
 * coalesced through `requestAnimationFrame`, so layout is read at most once
 * per frame. Skipped entirely for reduced-motion visitors and coarse
 * (touch) pointers, where a hover effect makes no sense.
 *
 * The optional value is the maximum tilt in degrees (default `6`).
 *
 * @example
 * ```vue
 * <article class="card tilt" v-tilt="5">…</article>
 * ```
 */
interface TiltElement extends HTMLElement {
  _pbTiltMove?: (event: PointerEvent) => void;
  _pbTiltLeave?: () => void;
  _pbTiltFrame?: number;
}

const tilt: Directive<TiltElement, number | undefined> = {
  mounted(el, binding) {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }
    const max = binding.value ?? 6;
    let lastX = 0;
    let lastY = 0;

    const apply = (): void => {
      el._pbTiltFrame = 0;
      const rect = el.getBoundingClientRect();
      const px = (lastX - rect.left) / rect.width - 0.5;
      const py = (lastY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--tilt-y", `${(px * max * 2).toFixed(2)}deg`);
      el.style.setProperty("--tilt-x", `${(-py * max * 2).toFixed(2)}deg`);
    };

    el._pbTiltMove = (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!el._pbTiltFrame) el._pbTiltFrame = requestAnimationFrame(apply);
    };
    el._pbTiltLeave = () => {
      if (el._pbTiltFrame) cancelAnimationFrame(el._pbTiltFrame);
      el._pbTiltFrame = 0;
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    };
    el.classList.add("tilt");
    el.addEventListener("pointermove", el._pbTiltMove);
    el.addEventListener("pointerleave", el._pbTiltLeave);
  },

  beforeUnmount(el) {
    if (el._pbTiltMove) el.removeEventListener("pointermove", el._pbTiltMove);
    if (el._pbTiltLeave) el.removeEventListener("pointerleave", el._pbTiltLeave);
    if (el._pbTiltFrame) cancelAnimationFrame(el._pbTiltFrame);
  },
};

export default tilt;
