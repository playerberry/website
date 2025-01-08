<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <nav class="uk-navbar-container uk-margin-small-top">
    <div class="uk-container">
      <div uk-navbar>
        <div class="uk-navbar-left">
          <RouterLink to="/" class="uk-navbar-item uk-logo"
            >PlayerBerry</RouterLink
          >
        </div>
        <div class="uk-navbar-right">
          <ul class="uk-navbar-nav uk-visible@s">
            <li>
              <RouterLink to="/">Hakkımızda</RouterLink>
            </li>
            <li>
              <RouterLink to="/">Projeler</RouterLink>
            </li>
            <li>
              <RouterLink to="/">Blog</RouterLink>
            </li>
          </ul>
          <a
            href="#"
            class="uk-navbar-toggle uk-hidden@s"
            uk-navbar-toggle-icon
            uk-toggle="target: #sidenav"
          ></a>
        </div>
      </div>
    </div>
  </nav>
  <div id="sidenav" uk-offcanvas="flip: true" class="uk-offcanvas">
    <div class="uk-offcanvas-bar">
      <ul class="uk-nav">
        <li>
          <RouterLink class="uk-text-large" to="/">Hakkımızda</RouterLink>
        </li>
        <li>
          <RouterLink class="uk-text-large" to="/">Projeler</RouterLink>
        </li>
        <li>
          <RouterLink class="uk-text-large" to="/">Blog</RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
