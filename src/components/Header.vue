<script setup lang="ts">
/**
 * Site header.
 *
 * A sticky, glassy navigation bar with the PlayerBerry wordmark, the primary
 * menu, a language dropdown (built from the supported-locale list, showing
 * each language's native name) and a contact call-to-action. The bar turns
 * slightly more opaque once the page is scrolled. On narrow screens the menu
 * collapses behind a hamburger button that opens a full-screen panel; while
 * it is open the document cannot scroll, and it closes on Escape, on a
 * navigation, or when the viewport grows to the desktop layout.
 */
import { onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { saveLocaleChoice } from "../i18n";
import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "../assets/js/locales";
import { localePath, stripLocale } from "../assets/js/seo";
import { useLocalePath } from "../composables/useLocalePath";

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const lp = useLocalePath();

/** DOM id of the mobile menu panel (target of `aria-controls`). */
const MENU_ID = "sidenav";

/** Whether the mobile menu panel is open. */
const menuOpen = ref(false);

/** Whether the page has been scrolled away from the very top. */
const scrolled = ref(false);

/** Close the mobile menu (used after a nav link is tapped). */
const closeMenu = () => (menuOpen.value = false);

/** Toggle the mobile menu from the hamburger button. */
const toggleMenu = () => (menuOpen.value = !menuOpen.value);

/** Track the scroll position to tint the bar once content slides under it. */
const onScroll = () => (scrolled.value = window.scrollY > 8);

/** Close the menu with the Escape key. */
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") closeMenu();
};

/** Media query matching the desktop layout (Tailwind's `md` breakpoint). */
let desktop: MediaQueryList | undefined;

/** Close the menu when the viewport grows into the desktop layout. */
const onDesktopChange = (event: MediaQueryListEvent) => {
  if (event.matches) closeMenu();
};

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  desktop = window.matchMedia("(min-width: 48rem)");
  desktop.addEventListener("change", onDesktopChange);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  document.removeEventListener("keydown", onKeydown);
  desktop?.removeEventListener("change", onDesktopChange);
  document.body.style.overflow = "";
});

// Lock the document scroll and listen for Escape while the panel is open.
watch(menuOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
  if (open) document.addEventListener("keydown", onKeydown);
  else document.removeEventListener("keydown", onKeydown);
});

// Any navigation (including a language switch) dismisses the panel.
watch(() => route.fullPath, closeMenu);

/**
 * Switch the UI language by navigating to the current page's URL in that
 * language (`/tr/projects`): the router's locale guard loads the catalogue
 * and activates it, and the address bar ends up on the page's canonical,
 * shareable URL. The choice is persisted so it overrides the country-based
 * detection on later visits. The router serialises navigations, so rapid
 * successive changes settle on the last one.
 *
 * If the catalogue cannot be fetched the guard keeps the current language;
 * the `<select>` is then reset to it so the control never shows a language
 * the page is not actually in.
 *
 * @param value - The locale to activate.
 * @param select - The `<select>` that requested the change.
 */
const setLocale = async (
  value: Locale,
  select: HTMLSelectElement,
): Promise<void> => {
  saveLocaleChoice(value);
  await router.replace({
    path: localePath(stripLocale(route.path), value),
    query: route.query,
    hash: route.hash,
  });
  select.value = locale.value;
};

/**
 * Handle a change on one of the language `<select>` elements.
 *
 * @param event - The change event whose target holds the chosen locale.
 */
const onLocaleChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (isSupportedLocale(select.value)) void setLocale(select.value, select);
};
</script>

<template>
  <header
    class="glass sticky top-0 z-50 border-b transition-[background-color,border-color] duration-500 ease-out-soft"
    :class="scrolled ? 'border-line-strong bg-bg/90' : 'border-line'"
  >
    <div class="container-pb">
      <nav class="flex h-16 items-center justify-between gap-4">
        <RouterLink
          :to="lp('/')"
          class="wordmark inline-flex h-11 items-center font-display text-xl font-bold tracking-tight text-ink-strong"
        >
          player<span class="text-berry">berry</span
          ><span class="animate-blink text-berry" aria-hidden="true">_</span>
        </RouterLink>

        <div class="hidden items-center gap-1 md:flex">
          <ul class="flex items-center gap-1">
            <li>
              <RouterLink :to="lp('/projects')" class="nav-link">{{
                $t("menu.projects")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/blog')" class="nav-link">{{
                $t("menu.blog")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/store')" class="nav-link">{{
                $t("menu.store")
              }}</RouterLink>
            </li>
          </ul>

          <div class="relative ml-3">
            <select
              class="lang-select h-9 appearance-none rounded-full border border-line bg-white/[0.03] pr-8 pl-4 font-mono text-xs text-ink transition-colors duration-200 hover:border-berry/50 hover:text-ink-strong"
              :aria-label="$t('a11y.language')"
              :value="locale"
              @change="onLocaleChange"
            >
              <option
                v-for="code in SUPPORTED_LOCALES"
                :key="code"
                :value="code"
                :lang="code"
              >
                {{ LOCALE_NAMES[code] }}
              </option>
            </select>
            <Icon
              name="chevron-down"
              class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[0.6rem] text-muted"
            />
          </div>

          <RouterLink :to="lp('/contact')" class="btn btn-primary btn-sm ml-3">{{
            $t("menu.contact")
          }}</RouterLink>
        </div>

        <button
          class="burger relative -mr-2 grid size-11 place-items-center rounded-full text-ink-strong transition-colors duration-200 hover:text-berry md:hidden"
          :class="{ 'is-open': menuOpen }"
          type="button"
          :aria-label="$t('a11y.menu')"
          :aria-controls="MENU_ID"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          <span class="burger-line" aria-hidden="true"></span>
          <span class="burger-line" aria-hidden="true"></span>
          <span class="burger-line" aria-hidden="true"></span>
        </button>
      </nav>
    </div>
  </header>

  <Transition name="menu" :duration="{ enter: 800, leave: 260 }">
    <div
      v-if="menuOpen"
      :id="MENU_ID"
      class="menu-panel fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-bg md:hidden"
    >
      <div class="container-pb flex h-16 shrink-0 items-center justify-between">
        <RouterLink
          :to="lp('/')"
          class="inline-flex h-11 items-center font-display text-xl font-bold tracking-tight text-ink-strong"
          @click="closeMenu"
        >
          player<span class="text-berry">berry</span
          ><span class="animate-blink text-berry" aria-hidden="true">_</span>
        </RouterLink>
        <button
          class="-mr-2 grid size-11 place-items-center rounded-full border border-line text-ink-strong transition-colors duration-200 hover:border-berry/50 hover:text-berry"
          type="button"
          :aria-label="$t('a11y.close')"
          @click="closeMenu"
        >
          <Icon name="xmark" class="text-lg" />
        </button>
      </div>

      <nav class="container-pb flex flex-1 flex-col justify-center py-10">
        <ul class="flex flex-col gap-2">
          <li class="menu-item" style="--i: 0">
            <RouterLink :to="lp('/')" class="menu-link" @click="closeMenu">
              <span class="menu-index">01</span>{{ $t("menu.home") }}
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 1">
            <RouterLink :to="lp('/projects')" class="menu-link" @click="closeMenu">
              <span class="menu-index">02</span>{{ $t("menu.projects") }}
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 2">
            <RouterLink :to="lp('/blog')" class="menu-link" @click="closeMenu">
              <span class="menu-index">03</span>{{ $t("menu.blog") }}
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 3">
            <RouterLink :to="lp('/store')" class="menu-link" @click="closeMenu">
              <span class="menu-index">04</span>{{ $t("menu.store") }}
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 4">
            <RouterLink :to="lp('/contact')" class="menu-link" @click="closeMenu">
              <span class="menu-index">05</span>{{ $t("menu.contact") }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div
        class="menu-item container-pb flex shrink-0 items-center justify-between gap-4 border-t border-line py-6"
        style="--i: 5"
      >
        <div class="relative">
          <select
            class="lang-select h-11 appearance-none rounded-full border border-line bg-white/[0.03] pr-9 pl-4 font-mono text-xs text-ink transition-colors duration-200 hover:border-berry/50"
            :aria-label="$t('a11y.language')"
            :value="locale"
            @change="onLocaleChange"
          >
            <option
              v-for="code in SUPPORTED_LOCALES"
              :key="code"
              :value="code"
              :lang="code"
            >
              {{ LOCALE_NAMES[code] }}
            </option>
          </select>
          <Icon
            name="chevron-down"
            class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[0.6rem] text-muted"
          />
        </div>
        <RouterLink :to="lp('/contact')" class="btn btn-primary" @click="closeMenu">{{
          $t("menu.contact")
        }}</RouterLink>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Desktop nav links: a berry dot slides in under the active page. ──── */
.nav-link {
  position: relative;
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  transition: color 0.2s ease;
}
.nav-link::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0.25rem;
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 999px;
  background: var(--color-berry);
  opacity: 0;
  transform: translate(-50%, 4px);
  transition:
    opacity 0.3s ease,
    transform 0.4s var(--ease-out-expo);
}
.nav-link:hover {
  color: var(--color-ink-strong);
}
.nav-link.router-link-active {
  color: var(--color-ink-strong);
}
.nav-link.router-link-active::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* The native option list keeps the dark surface. */
.lang-select option {
  background: var(--color-surface);
  color: var(--color-ink);
}

/* ── Hamburger: three lines fold into an X. ──────────────────────────── */
.burger-line {
  position: absolute;
  width: 1.25rem;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transition:
    transform 0.4s var(--ease-out-expo),
    opacity 0.2s ease;
}
.burger-line:nth-child(1) {
  transform: translateY(-6px);
}
.burger-line:nth-child(3) {
  transform: translateY(6px);
}
.burger.is-open .burger-line:nth-child(1) {
  transform: rotate(45deg);
}
.burger.is-open .burger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.burger.is-open .burger-line:nth-child(3) {
  transform: rotate(-45deg);
}

/* ── Mobile panel ─────────────────────────────────────────────────────── */
.menu-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.5rem 0;
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  transition: color 0.2s ease;
}
.menu-link:hover,
.menu-link.router-link-active {
  color: var(--color-ink-strong);
}
.menu-link.router-link-active .menu-index {
  color: var(--color-berry);
}
.menu-index {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--color-muted);
}

/* Panel fades in; the items rise in a staggered cascade behind it. */
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.5s var(--ease-out-expo);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
.menu-enter-active .menu-item {
  transition:
    opacity 0.5s ease,
    transform 0.7s var(--ease-out-expo);
  transition-delay: calc(80ms + var(--i, 0) * 55ms);
}
.menu-enter-from .menu-item {
  opacity: 0;
  transform: translateY(16px);
}
</style>
