<script setup lang="ts">
/**
 * ContactView (`/contact`)
 *
 * A two-column contact spread: eyebrow, title, lead and social links on the
 * left; the studio email set as oversized gradient type on the right with a
 * one-click copy button, framed by a slowly orbiting gradient ring. No form —
 * the primary call to action is the `mailto:` link. The copy result is
 * announced through a live region for assistive technology.
 */
import { computed, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

/** The studio inbox, used for both the `mailto:` link and the copy button. */
const EMAIL = "hello@playerberry.com";

/** Social profiles rendered as round icon buttons. */
const socials = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/playerberry" },
  { name: "Twitch", icon: "twitch", href: "https://twitch.tv/playerberry" },
  { name: "YouTube", icon: "youtube", href: "https://youtube.com/@playerberry" },
  { name: "X", icon: "twitter", href: "https://x.com/playerberry" },
];

/** Copy feedback state; returns to `idle` shortly after a copy attempt. */
type CopyStatus = "idle" | "copied" | "failed";
const status = ref<CopyStatus>("idle");
let feedbackTimer = 0;

/** The copy button's label for the current status. */
const copyLabel = computed(() => {
  if (status.value === "copied") return t("blog.copied");
  if (status.value === "failed") return t("blog.copyFailed");
  return t("blog.copy");
});

/** Copy the email address to the clipboard and flash the result. */
const copyEmail = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    status.value = "copied";
  } catch {
    status.value = "failed";
  }
  window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    status.value = "idle";
  }, 2200);
};

onUnmounted(() => window.clearTimeout(feedbackTimer));
</script>

<template>
  <section class="section relative grid-lines overflow-hidden">
    <div class="container-pb relative">
      <div class="grid gap-16 lg:min-h-[70vh] lg:grid-cols-12 lg:items-center lg:gap-10">
        <!-- Left: the ask, and where else to find us. -->
        <div v-reveal class="lg:col-span-5">
          <p class="section-head">
            <span class="index">01</span>
            <span>{{ t("contact.eyebrow") }}</span>
          </p>
          <h1 class="display-lg mt-8">{{ t("contact.title") }}</h1>
          <p class="lead mt-6">{{ t("contact.lead") }}</p>

          <ul class="mt-10 flex flex-wrap gap-3" :aria-label="t('footer.follow')">
            <li v-for="social in socials" :key="social.name">
              <a
                :href="social.href"
                class="grid size-12 place-items-center rounded-full border border-line text-ink transition duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-berry/60 hover:text-berry"
                target="_blank"
                rel="noopener"
                :aria-label="social.name"
                ><Icon :name="social.icon"
              /></a>
            </li>
          </ul>
        </div>

        <!-- Right: the address, oversized, with an orbiting gradient ring behind. -->
        <div v-reveal="160" class="relative isolate lg:col-span-7">
          <div
            class="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 lg:left-[58%]"
            aria-hidden="true"
          >
            <div class="ring-orbit animate-orbit size-[min(420px,88vw)]"></div>
            <div
              class="ring-orbit is-inner animate-spin-slow absolute inset-[18%] [animation-direction:reverse]"
            ></div>
            <div
              class="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-berry shadow-glow animate-pulse-soft"
            ></div>
          </div>

          <div class="py-10 lg:py-16">
            <p class="meta-row">
              <span class="text-berry">// mailto</span>
              <span class="text-cyan">❯</span>
            </p>
            <!-- Sized so the address stays on one line from 360px up; wraps
                 anywhere only as a last resort. -->
            <a
              class="gradient-text display-md mt-4 inline-block text-[clamp(1.7rem,4.1vw,3.6rem)] [overflow-wrap:anywhere]"
              :href="`mailto:${EMAIL}`"
              >{{ EMAIL }}</a
            >
            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <p class="text-muted">{{ t("contact.note") }}</p>
              <button
                class="btn btn-secondary btn-sm"
                :class="{ 'border-cyan/50 text-cyan': status === 'copied' }"
                type="button"
                @click="copyEmail"
              >
                <Icon :name="status === 'copied' ? 'check' : 'copy'" />
                {{ copyLabel }}
              </button>
              <span class="sr-only" role="status" aria-live="polite">{{
                status === "idle" ? "" : copyLabel
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Gradient ring: a conic berry→violet→cyan sweep that fades to nothing over
 * the last quarter, masked down to a thin band so only the rim shows. The
 * `animate-orbit` rotation is transform-only; no blur anywhere.
 */
.ring-orbit {
  border-radius: 9999px;
  background: conic-gradient(
    from 0deg,
    var(--color-berry),
    var(--color-violet) 35%,
    var(--color-cyan) 60%,
    transparent 78%
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 1.5px),
    black calc(100% - 1.5px)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 1.5px),
    black calc(100% - 1.5px)
  );
  opacity: 0.8;
}
.ring-orbit.is-inner {
  opacity: 0.35;
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 1px),
    black calc(100% - 1px)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 1px),
    black calc(100% - 1px)
  );
}
</style>
