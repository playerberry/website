<script setup lang="ts">
/**
 * Site header.
 *
 * A thin, glassy bar with a gradient hairline along its top edge that
 * brightens once the page is scrolled. Left: the `playerberry_` wordmark;
 * centre (desktop): the indexed, monospace primary menu with an underline
 * that draws in under the active page; right: the language pill (built from
 * the supported-locale list, showing each language's native name) and the
 * contact call-to-action. On narrow screens the menu collapses behind a
 * hamburger that opens a full-screen panel of oversized links, the language
 * pill, the social profiles and the contact button; while it is open the
 * document cannot scroll, and it closes on Escape, on a navigation, or when
 * the viewport grows to the desktop layout.
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

/** Social profiles listed at the foot of the mobile menu. */
const socials = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/playerberry" },
  { name: "Twitch", icon: "twitch", href: "https://twitch.tv/playerberry" },
  { name: "YouTube", icon: "youtube", href: "https://youtube.com/@playerberry" },
  { name: "X", icon: "twitter", href: "https://x.com/playerberry" },
  { name: "Facebook", icon: "facebook", href: "https://facebook.com/playerberry" },
];

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
    class="site-header glass sticky top-0 z-50 border-b transition-[border-color] duration-500 ease-out-soft"
    :class="scrolled ? 'is-scrolled border-line-strong' : 'border-line'"
  >
    <div class="container-pb">
      <nav
        class="flex h-16 items-center justify-between gap-4 md:grid md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr]"
      >
        <RouterLink
          :to="lp('/')"
          class="wordmark inline-flex h-11 items-center font-display text-xl font-bold tracking-tight text-ink-strong"
        >
          player<span class="text-berry">berry</span
          ><span class="animate-blink text-berry" aria-hidden="true">_</span>
        </RouterLink>

        <ul class="hidden items-center gap-6 md:flex lg:gap-10">
          <li>
            <RouterLink :to="lp('/projects')" class="nav-link">
              <span class="nav-index hidden lg:inline" aria-hidden="true">01</span>
              <span class="link-line nav-label">{{ $t("menu.projects") }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="lp('/blog')" class="nav-link">
              <span class="nav-index hidden lg:inline" aria-hidden="true">02</span>
              <span class="link-line nav-label">{{ $t("menu.blog") }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="lp('/store')" class="nav-link">
              <span class="nav-index hidden lg:inline" aria-hidden="true">03</span>
              <span class="link-line nav-label">{{ $t("menu.store") }}</span>
            </RouterLink>
          </li>
        </ul>

        <div class="hidden items-center justify-end gap-3 md:flex">
          <div class="relative">
            <Icon
              name="globe"
              class="pointer-events-none absolute top-1/2 left-3.5 hidden -translate-y-1/2 text-[0.7rem] text-muted lg:block"
            />
            <select
              class="lang-select h-10 appearance-none rounded-full border border-line bg-surface pr-8 pl-4 font-mono text-xs tracking-[0.04em] text-ink transition-colors duration-200 hover:border-berry/50 hover:text-ink-strong lg:pl-8"
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

          <RouterLink
            v-magnetic
            :to="lp('/contact')"
            class="btn btn-primary btn-sm"
          >
            {{ $t("menu.contact") }}
            <Icon name="arrow-right" class="hidden text-[0.8em] lg:inline-block" />
          </RouterLink>
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

  <Transition name="menu" :duration="{ enter: 1000, leave: 300 }">
    <div
      v-if="menuOpen"
      :id="MENU_ID"
      class="menu-panel grid-lines fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-bg md:hidden"
    >
      <div
        class="container-pb relative flex h-16 shrink-0 items-center justify-between"
      >
        <RouterLink
          :to="lp('/')"
          class="inline-flex h-11 items-center font-display text-xl font-bold tracking-tight text-ink-strong"
          @click="closeMenu"
        >
          player<span class="text-berry">berry</span
          ><span class="animate-blink text-berry" aria-hidden="true">_</span>
        </RouterLink>
        <button
          class="menu-item -mr-2 grid size-11 place-items-center rounded-full border border-line text-ink-strong transition-colors duration-200 hover:border-berry/50 hover:text-berry"
          style="--i: 0"
          type="button"
          :aria-label="$t('a11y.close')"
          @click="closeMenu"
        >
          <Icon name="xmark" class="text-lg" />
        </button>
      </div>

      <nav class="container-pb relative flex flex-1 flex-col justify-center py-8">
        <ul class="flex flex-col">
          <li class="menu-item" style="--i: 1">
            <RouterLink :to="lp('/')" class="menu-link" @click="closeMenu">
              <span class="menu-index" aria-hidden="true">01</span>
              <span class="menu-word">{{ $t("menu.home") }}</span>
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 2">
            <RouterLink :to="lp('/projects')" class="menu-link" @click="closeMenu">
              <span class="menu-index" aria-hidden="true">02</span>
              <span class="menu-word">{{ $t("menu.projects") }}</span>
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 3">
            <RouterLink :to="lp('/blog')" class="menu-link" @click="closeMenu">
              <span class="menu-index" aria-hidden="true">03</span>
              <span class="menu-word">{{ $t("menu.blog") }}</span>
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 4">
            <RouterLink :to="lp('/store')" class="menu-link" @click="closeMenu">
              <span class="menu-index" aria-hidden="true">04</span>
              <span class="menu-word">{{ $t("menu.store") }}</span>
            </RouterLink>
          </li>
          <li class="menu-item" style="--i: 5">
            <RouterLink :to="lp('/contact')" class="menu-link" @click="closeMenu">
              <span class="menu-index" aria-hidden="true">05</span>
              <span class="menu-word">{{ $t("menu.contact") }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div
        class="menu-item container-pb relative shrink-0 border-t border-line py-6"
        style="--i: 6"
      >
        <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-5">
          <ul class="flex items-center gap-2" :aria-label="$t('footer.follow')">
            <li v-for="social in socials" :key="social.icon">
              <a
                :href="social.href"
                target="_blank"
                rel="noopener"
                :aria-label="social.name"
                class="social grid size-11 place-items-center rounded-full border border-line text-ink transition-colors duration-200 hover:border-berry/60 hover:text-berry"
                ><Icon :name="social.icon"
              /></a>
            </li>
          </ul>

          <div class="flex items-center gap-3">
            <div class="relative">
              <Icon
                name="globe"
                class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.7rem] text-muted"
              />
              <select
                class="lang-select h-11 appearance-none rounded-full border border-line bg-surface pr-9 pl-8 font-mono text-xs tracking-[0.04em] text-ink transition-colors duration-200 hover:border-berry/50"
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
            <RouterLink
              :to="lp('/contact')"
              class="btn btn-primary h-11 px-6"
              @click="closeMenu"
            >
              {{ $t("menu.contact") }}
              <Icon name="arrow-right" class="text-[0.8em]" />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Bar: a gradient hairline along the top edge brightens on scroll. ── */
.site-header::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    var(--color-berry),
    var(--color-violet),
    var(--color-cyan)
  );
  opacity: 0.35;
  transition: opacity 0.6s ease;
}
.site-header.is-scrolled::before {
  opacity: 1;
}

/* ── Desktop nav: indexed mono labels, underline draws under the active page. */
.nav-link {
  display: inline-flex;
  height: 2.75rem;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  transition: color 0.2s ease;
}
.nav-index {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: rgba(0, 0, 0, 0.35);
  transition: color 0.2s ease;
}
.nav-label {
  color: inherit;
  padding-bottom: 0.15em;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-ink-strong);
}
.nav-link:hover .nav-index,
.nav-link.router-link-active .nav-index {
  color: var(--color-berry);
}
.nav-link:hover .nav-label,
.nav-link.router-link-active .nav-label {
  background-size: 100% 1px;
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

/* ── Full-screen panel ───────────────────────────────────────────────── */
.menu-panel::before {
  position: fixed;
  opacity: 0.3;
}
.menu-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.45rem 0;
  color: var(--color-ink-strong);
}
.menu-index {
  flex: none;
  width: 1.6rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  color: var(--color-muted);
  transition: color 0.2s ease;
}
.menu-word {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 11.5vw, 5.5rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.035em;
  transition: transform 0.5s var(--ease-out-expo);
}
.menu-link:hover .menu-word {
  transform: translateX(0.35rem);
  background: linear-gradient(
    -45deg,
    var(--color-amber),
    var(--color-berry),
    var(--color-violet),
    var(--color-blue),
    var(--color-cyan)
  );
  background-size: 420% 420%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: var(--animate-gradient-shift);
}
.menu-link:hover .menu-index,
.menu-link.router-link-active .menu-index {
  color: var(--color-berry);
}

/* Panel wipes down; rows rise in a staggered cascade behind it. */
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.3s ease,
    clip-path 0.8s var(--ease-out-expo);
}
.menu-enter-from {
  clip-path: inset(0 0 100% 0);
}
.menu-leave-to {
  opacity: 0;
}
.menu-enter-active .menu-item {
  transition:
    opacity 0.5s ease,
    transform 0.8s var(--ease-out-expo);
  transition-delay: calc(140ms + var(--i, 0) * 60ms);
}
.menu-enter-from .menu-item {
  opacity: 0;
  transform: translateY(28px);
}
</style>
