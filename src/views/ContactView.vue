<script setup lang="ts">
/**
 * ContactView (`/contact`)
 *
 * A focused contact card with the studio email and social links. No form —
 * the primary call to action is a `mailto:` link.
 */
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <section class="section">
    <div class="container-pb text-center">
      <div v-reveal>
        <p class="eyebrow">{{ t("contact.eyebrow") }}</p>
        <h1 class="section-title mx-auto mt-3 max-w-3xl">
          {{ t("contact.title") }}
        </h1>
        <p class="lead mx-auto mt-4">{{ t("contact.lead") }}</p>
      </div>

      <div v-reveal="120" class="relative isolate mx-auto mt-12 max-w-xl">
        <!-- Soft brand glow behind the card (no filter blur: a plain radial gradient). -->
        <div
          class="absolute -inset-x-4 -inset-y-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,61,119,0.16),rgba(139,92,246,0.08)_55%,transparent)] sm:-inset-x-8 lg:-inset-x-12"
          aria-hidden="true"
        ></div>

        <div class="card card-static px-6 py-10 sm:px-10 sm:py-12">
          <a
            class="font-display text-2xl font-semibold break-all text-ink-strong transition-colors duration-300 hover:text-berry sm:text-3xl"
            href="mailto:hello@playerberry.com"
            >hello@playerberry.com</a
          >
          <p class="mt-3">{{ t("contact.note") }}</p>

          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://instagram.com/playerberry"
              class="grid size-11 place-items-center rounded-full border border-line text-ink transition duration-300 ease-out-soft hover:border-berry/50 hover:text-berry"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              ><Icon name="instagram"
            /></a>
            <a
              href="https://twitch.tv/playerberry"
              class="grid size-11 place-items-center rounded-full border border-line text-ink transition duration-300 ease-out-soft hover:border-berry/50 hover:text-berry"
              target="_blank"
              rel="noopener"
              aria-label="Twitch"
              ><Icon name="twitch"
            /></a>
            <a
              href="https://youtube.com/@playerberry"
              class="grid size-11 place-items-center rounded-full border border-line text-ink transition duration-300 ease-out-soft hover:border-berry/50 hover:text-berry"
              target="_blank"
              rel="noopener"
              aria-label="YouTube"
              ><Icon name="youtube"
            /></a>
            <a
              href="https://x.com/playerberry"
              class="grid size-11 place-items-center rounded-full border border-line text-ink transition duration-300 ease-out-soft hover:border-berry/50 hover:text-berry"
              target="_blank"
              rel="noopener"
              aria-label="X"
              ><Icon name="twitter"
            /></a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
