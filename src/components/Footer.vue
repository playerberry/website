<script setup lang="ts">
import { RouterLink } from "vue-router";
import sentence from "../assets/js/random.ts";
const randomizedFunny = sentence();
const year = new Date().getFullYear();
</script>

<template>
  <div class="uk-text-center footer uk-margin-large-top">
    <div class="links">
      <ul>
        <li>
          <a href="https://instagram.com/playerberry" target="_blank"
            ><i class="fab fa-instagram"></i
          ></a>
        </li>

        <li>
          <a href="https://twitch.tv/playerberry" target="_blank"
            ><i class="fab fa-twitch"></i
          ></a>
        </li>
        <li>
          <a href="https://youtube.com/@playerberry" target="_blank"
            ><i class="fab fa-youtube"></i
          ></a>
        </li>
        <li>
          <a href="https://x.com/playerberry" target="_blank"
            ><i class="fab fa-twitter"></i
          ></a>
        </li>
        <li>
          <a href="https://facebook.com/playerberry" target="_blank"
            ><i class="fab fa-facebook"></i
          ></a>
        </li>
      </ul>
    </div>
    <div class="policies uk-margin-top">
      <ul>
        <li>
          <RouterLink to="/about-us">{{ $t("footer.about") }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/privacy-policy">{{
            $t("footer.privacy")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/cookies-policy">{{
            $t("footer.cookies")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/terms-and-conditions">{{
            $t("footer.terms")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/contact">{{ $t("footer.contact") }}</RouterLink>
        </li>
      </ul>
    </div>
    <div class="copyright uk-margin">
      <p>
        {{ $t("footer.randomized.part0") }}
        <a
          :href="'https://www.google.com/search?q=' + randomizedFunny"
          target="_blank"
          ><span class="sentence">{{ randomizedFunny }}</span></a
        >
        {{ $t("footer.randomized.part1") }} <br />{{
          $t("footer.rights")
        }}
        &copy; {{ year }}
      </p>
    </div>
  </div>
</template>
