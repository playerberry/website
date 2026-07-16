<script setup lang="ts">
/**
 * Site header.
 *
 * A sticky, glassy navigation bar with the PlayerBerry wordmark, the primary
 * menu, a TR/EN language switch and a contact call-to-action. On narrow
 * screens the menu collapses into a UIkit off-canvas drawer.
 */
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import UIkit from "uikit";

const { locale } = useI18n();

/** Close the mobile off-canvas menu (used after a nav link is tapped). */
const closeMenu = () => UIkit.offcanvas("#sidenav").hide();

/**
 * Switch the active UI language, persist the choice and update `<html lang>`.
 *
 * @param value - The locale to activate.
 */
const setLocale = (value: "tr" | "en") => {
  locale.value = value;
  localStorage.setItem("pb:locale", value);
  document.documentElement.lang = value;
};
</script>

<template>
  <header class="pb-header">
    <div class="uk-container uk-container-large">
      <nav uk-navbar>
        <div class="uk-navbar-left">
          <RouterLink to="/" class="uk-navbar-item uk-logo pb-logo">
            player<span class="pb-logo-berry">berry</span
            ><span class="pb-logo-cursor">_</span>
          </RouterLink>
        </div>
        <div class="uk-navbar-right">
          <ul class="uk-navbar-nav uk-visible@m">
            <li>
              <RouterLink to="/projects">{{ $t("menu.projects") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/blog">{{ $t("menu.blog") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/store">{{ $t("menu.store") }}</RouterLink>
            </li>
          </ul>
          <div class="pb-lang uk-navbar-item uk-visible@m" role="group" aria-label="Language">
            <button
              type="button"
              :class="{ 'is-active': locale === 'tr' }"
              :aria-pressed="locale === 'tr'"
              @click="setLocale('tr')"
            >
              TR
            </button>
            <span class="pb-lang-sep">/</span>
            <button
              type="button"
              :class="{ 'is-active': locale === 'en' }"
              :aria-pressed="locale === 'en'"
              @click="setLocale('en')"
            >
              EN
            </button>
          </div>
          <div class="uk-navbar-item uk-visible@m">
            <RouterLink
              to="/contact"
              class="uk-button uk-button-primary uk-button-small"
              >{{ $t("menu.contact") }}</RouterLink
            >
          </div>
          <a
            href="#"
            class="uk-navbar-toggle uk-hidden@m"
            uk-navbar-toggle-icon
            uk-toggle="target: #sidenav"
            aria-label="Menu"
          ></a>
        </div>
      </nav>
    </div>
  </header>
  <div id="sidenav" uk-offcanvas="flip: true; overlay: true">
    <div class="uk-offcanvas-bar">
      <button class="uk-offcanvas-close" type="button" uk-close></button>
      <ul class="uk-nav uk-margin-large-top">
        <li>
          <RouterLink to="/" @click="closeMenu">{{
            $t("menu.home")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/projects" @click="closeMenu">{{
            $t("menu.projects")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/blog" @click="closeMenu">{{
            $t("menu.blog")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/store" @click="closeMenu">{{
            $t("menu.store")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/contact" @click="closeMenu">{{
            $t("menu.contact")
          }}</RouterLink>
        </li>
      </ul>
      <div class="pb-lang pb-lang-mobile uk-margin-top" role="group" aria-label="Language">
        <button
          type="button"
          :class="{ 'is-active': locale === 'tr' }"
          :aria-pressed="locale === 'tr'"
          @click="setLocale('tr')"
        >
          TR
        </button>
        <span class="pb-lang-sep">/</span>
        <button
          type="button"
          :class="{ 'is-active': locale === 'en' }"
          :aria-pressed="locale === 'en'"
          @click="setLocale('en')"
        >
          EN
        </button>
      </div>
    </div>
  </div>
</template>
