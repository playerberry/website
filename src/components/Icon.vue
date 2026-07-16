<script setup lang="ts">
/**
 * Icon
 *
 * Renders one of the site's icons as inline SVG. Only the ~23 icons the site
 * actually uses are bundled (imported as raw strings and inlined by Vite),
 * replacing the full Font Awesome CSS + webfonts (~350 KB) with a few KB.
 *
 * The SVGs come from `@fortawesome/fontawesome-free` and keep their embedded
 * license comment (CC BY 4.0 attribution). They draw with `currentColor`, so
 * icons inherit the surrounding text colour, and are sized to `1em` via the
 * `.pb-icon` styles so they scale with `font-size` exactly like the old
 * font-based icons did.
 *
 * @prop name - The icon to draw; one of the keys of the internal map.
 */
import { computed } from "vue";

// Brands
import facebook from "@fortawesome/fontawesome-free/svgs/brands/facebook.svg?raw";
import instagram from "@fortawesome/fontawesome-free/svgs/brands/instagram.svg?raw";
import twitch from "@fortawesome/fontawesome-free/svgs/brands/twitch.svg?raw";
import twitter from "@fortawesome/fontawesome-free/svgs/brands/x-twitter.svg?raw";
import youtube from "@fortawesome/fontawesome-free/svgs/brands/youtube.svg?raw";
// Regular
import copy from "@fortawesome/fontawesome-free/svgs/regular/copy.svg?raw";
// Solid
import arrowLeft from "@fortawesome/fontawesome-free/svgs/solid/arrow-left.svg?raw";
import arrowRight from "@fortawesome/fontawesome-free/svgs/solid/arrow-right.svg?raw";
import check from "@fortawesome/fontawesome-free/svgs/solid/check.svg?raw";
import cloud from "@fortawesome/fontawesome-free/svgs/solid/cloud.svg?raw";
import code from "@fortawesome/fontawesome-free/svgs/solid/code.svg?raw";
import cubes from "@fortawesome/fontawesome-free/svgs/solid/cubes.svg?raw";
import eye from "@fortawesome/fontawesome-free/svgs/solid/eye.svg?raw";
import gem from "@fortawesome/fontawesome-free/svgs/solid/gem.svg?raw";
import handshake from "@fortawesome/fontawesome-free/svgs/solid/handshake.svg?raw";
import icons from "@fortawesome/fontawesome-free/svgs/solid/icons.svg?raw";
import layerGroup from "@fortawesome/fontawesome-free/svgs/solid/layer-group.svg?raw";
import mobileScreen from "@fortawesome/fontawesome-free/svgs/solid/mobile-screen.svg?raw";
import palette from "@fortawesome/fontawesome-free/svgs/solid/palette.svg?raw";
import rocket from "@fortawesome/fontawesome-free/svgs/solid/rocket.svg?raw";
import rss from "@fortawesome/fontawesome-free/svgs/solid/rss.svg?raw";
import seedling from "@fortawesome/fontawesome-free/svgs/solid/seedling.svg?raw";
import server from "@fortawesome/fontawesome-free/svgs/solid/server.svg?raw";

/** Icon name → raw SVG markup. */
const svgs: Record<string, string> = {
  facebook,
  instagram,
  twitch,
  twitter,
  youtube,
  copy,
  "arrow-left": arrowLeft,
  "arrow-right": arrowRight,
  check,
  cloud,
  code,
  cubes,
  eye,
  gem,
  handshake,
  icons,
  "layer-group": layerGroup,
  "mobile-screen": mobileScreen,
  palette,
  rocket,
  rss,
  seedling,
  server,
};

const props = defineProps<{
  /** Icon key, e.g. `"instagram"` or `"arrow-right"`. */
  name: string;
}>();

/** The SVG markup for the requested icon (empty when the name is unknown). */
const svg = computed(() => svgs[props.name] ?? "");
</script>

<template>
  <!-- Static, trusted SVG strings bundled at build time — safe for v-html. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span class="pb-icon" aria-hidden="true" v-html="svg"></span>
</template>
