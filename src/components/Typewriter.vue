<script setup lang="ts">
/**
 * Typewriter
 *
 * Cycles through a list of phrases, typing each one out, holding it, then
 * deleting it before the next — the rotating word in the hero headline.
 * Renders the first phrase statically for reduced-motion visitors (and
 * before mount, so the prerendered/first paint already shows real text).
 *
 * @prop phrases - The phrases to cycle through, in order.
 */
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{ phrases: string[] }>();

/** The text currently shown. */
const text = ref(props.phrases[0] ?? "");

/** Whether the caret is visible (blinks while holding a phrase). */
const holding = ref(true);

let timer = 0;
let index = 0;
let animate = false;

/** Pace, in milliseconds. */
const TYPE_MS = 55;
const DELETE_MS = 32;
const HOLD_MS = 2200;
const GAP_MS = 350;

/**
 * Schedule the next step of the animation.
 *
 * @param fn - The step.
 * @param ms - Delay before it runs.
 */
const later = (fn: () => void, ms: number): void => {
  timer = window.setTimeout(fn, ms);
};

/** Type the phrase at `index`, character by character. */
const type = (): void => {
  const phrase = props.phrases[index] ?? "";
  holding.value = false;
  if (text.value.length < phrase.length) {
    text.value = phrase.slice(0, text.value.length + 1);
    later(type, TYPE_MS);
  } else {
    holding.value = true;
    later(erase, HOLD_MS);
  }
};

/** Delete the current phrase, then move on to the next one. */
const erase = (): void => {
  holding.value = false;
  if (text.value.length > 0) {
    text.value = text.value.slice(0, -1);
    later(erase, DELETE_MS);
  } else {
    index = (index + 1) % props.phrases.length;
    later(type, GAP_MS);
  }
};

/** (Re)start the cycle from the first phrase. */
const restart = (): void => {
  window.clearTimeout(timer);
  index = 0;
  text.value = props.phrases[0] ?? "";
  holding.value = true;
  if (animate && props.phrases.length > 1) later(erase, HOLD_MS);
};

onMounted(() => {
  animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  restart();
});

// A language switch swaps the phrases; start over with the new set.
watch(() => props.phrases, restart);

onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <span class="inline-flex items-baseline">
    <span>{{ text }}</span>
    <span
      class="ml-[0.06em] inline-block h-[0.9em] w-[0.06em] translate-y-[0.08em] bg-berry"
      :class="{ 'animate-blink': holding }"
      aria-hidden="true"
    ></span>
  </span>
</template>
