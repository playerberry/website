import type { Directive } from "vue";

/**
 * `v-magnetic` — buttons that lean towards the pointer.
 *
 * While the pointer is over the element it is translated a fraction of the
 * pointer's offset from its centre (default strength `0.25`, i.e. a quarter
 * of the distance) and springs back on leave. Transform only, coalesced to
 * one update per frame. Skipped for reduced-motion visitors and touch
 * pointers.
 *
 * @example
 * ```vue
 * <RouterLink class="btn btn-primary" v-magnetic>…</RouterLink>
 * ```
 */
interface MagneticElement extends HTMLElement {
  _pbMagMove?: (event: PointerEvent) => void;
  _pbMagLeave?: () => void;
  _pbMagFrame?: number;
}

const magnetic: Directive<MagneticElement, number | undefined> = {
  mounted(el, binding) {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }
    const strength = binding.value ?? 0.25;
    let lastX = 0;
    let lastY = 0;
    el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.willChange = "transform";

    const apply = (): void => {
      el._pbMagFrame = 0;
      const rect = el.getBoundingClientRect();
      const dx = lastX - (rect.left + rect.width / 2);
      const dy = lastY - (rect.top + rect.height / 2);
      el.style.transform = `translate3d(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px, 0)`;
    };

    el._pbMagMove = (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!el._pbMagFrame) el._pbMagFrame = requestAnimationFrame(apply);
    };
    el._pbMagLeave = () => {
      if (el._pbMagFrame) cancelAnimationFrame(el._pbMagFrame);
      el._pbMagFrame = 0;
      el.style.transform = "";
    };
    el.addEventListener("pointermove", el._pbMagMove);
    el.addEventListener("pointerleave", el._pbMagLeave);
  },

  beforeUnmount(el) {
    if (el._pbMagMove) el.removeEventListener("pointermove", el._pbMagMove);
    if (el._pbMagLeave) el.removeEventListener("pointerleave", el._pbMagLeave);
    if (el._pbMagFrame) cancelAnimationFrame(el._pbMagFrame);
  },
};

export default magnetic;
