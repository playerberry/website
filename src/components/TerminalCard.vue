<script setup lang="ts">
/**
 * TerminalCard
 *
 * A faux terminal window that "runs" a short, language-neutral session —
 * scaffolding, checks passing, a release shipping — line by line, then loops.
 * Pure DOM + timers (no canvas), transform/opacity only, and static (all
 * lines shown) for reduced-motion visitors. Decorative: hidden from
 * assistive tech.
 */
import { onMounted, onUnmounted, ref } from "vue";

/** One line of the session: a prompt command or an output line. */
interface Line {
  kind: "cmd" | "ok" | "info" | "ship";
  text: string;
}

const SESSION: Line[] = [
  { kind: "cmd", text: "pb create app --stack vue,swift,fastify" },
  { kind: "ok", text: "design system · 42 components" },
  { kind: "ok", text: "api · openapi contract generated" },
  { kind: "ok", text: "ios · swiftui shell linked" },
  { kind: "cmd", text: "pb test --coverage" },
  { kind: "ok", text: "312 passed · 98.4% coverage" },
  { kind: "cmd", text: "pb ship --env production" },
  { kind: "info", text: "building · 1.4s" },
  { kind: "ship", text: "shipped → https://your-product.app" },
];

/** Lines revealed so far (with the current command typed progressively). */
const shown = ref<Line[]>([]);

/** Characters of the current command typed so far. */
const typed = ref("");

let timer = 0;
let animate = false;

const later = (fn: () => void, ms: number): void => {
  timer = window.setTimeout(fn, ms);
};

/**
 * Reveal line `i`: commands are typed out, output lines appear after a beat.
 *
 * @param i - Index into {@link SESSION}.
 */
const step = (i: number): void => {
  if (i >= SESSION.length) {
    later(() => {
      shown.value = [];
      typed.value = "";
      step(0);
    }, 3600);
    return;
  }
  const line = SESSION[i];
  if (line.kind === "cmd") {
    typed.value = "";
    shown.value = [...shown.value, { kind: "cmd", text: "" }];
    const typeChar = (): void => {
      if (typed.value.length < line.text.length) {
        typed.value = line.text.slice(0, typed.value.length + 1);
        shown.value[shown.value.length - 1] = { kind: "cmd", text: typed.value };
        later(typeChar, 28);
      } else {
        later(() => step(i + 1), 420);
      }
    };
    later(typeChar, 300);
  } else {
    shown.value = [...shown.value, line];
    later(() => step(i + 1), line.kind === "ship" ? 900 : 260);
  }
};

onMounted(() => {
  animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate) step(0);
  else shown.value = SESSION;
});

onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <div
    class="relative overflow-hidden rounded-card border border-white/10 bg-[#0b0b12] text-white shadow-card"
    aria-hidden="true"
  >
    <div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
      <span class="size-2.5 rounded-full bg-[#ff5f57]"></span>
      <span class="size-2.5 rounded-full bg-[#febc2e]"></span>
      <span class="size-2.5 rounded-full bg-[#28c840]"></span>
      <span class="ml-3 font-mono text-[0.7rem] tracking-[0.14em] text-[#9a9aab] uppercase"
        >playerberry — zsh</span
      >
    </div>
    <div class="min-h-[280px] p-5 font-mono text-[0.8rem] leading-[1.9] sm:text-sm">
      <div v-for="(line, i) in shown" :key="i" class="flex gap-3">
        <template v-if="line.kind === 'cmd'">
          <span class="text-berry">❯</span>
          <span class="text-white"
            >{{ line.text
            }}<span
              v-if="i === shown.length - 1"
              class="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-blink bg-cyan"
            ></span
          ></span>
        </template>
        <template v-else-if="line.kind === 'ok'">
          <span class="text-cyan">✔</span><span class="text-[#9a9aab]">{{ line.text }}</span>
        </template>
        <template v-else-if="line.kind === 'info'">
          <span class="text-violet">…</span><span class="text-[#9a9aab]">{{ line.text }}</span>
        </template>
        <template v-else>
          <span class="text-amber">▲</span><span class="text-white">{{ line.text }}</span>
        </template>
      </div>
    </div>
    <div
      class="pointer-events-none absolute -right-20 -bottom-24 size-64 rounded-full opacity-60"
      style="
        background: radial-gradient(
          closest-side,
          rgba(139, 92, 246, 0.35),
          transparent
        );
      "
    ></div>
  </div>
</template>
