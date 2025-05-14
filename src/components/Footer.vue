<script setup lang="ts">
import { RouterLink } from "vue-router";
import sentence from "../assets/js/random.ts";
const randomizedFunny = sentence();
const year = new Date().getFullYear();
</script>

<template>
  <div class="uk-text-center footer uk-margin-xlarge-top">
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
          <RouterLink to="/privacy-policy">Gizlilik Politikası</RouterLink>
        </li>
        <li>
          <RouterLink to="/cookies-policy">Çerez Politikası</RouterLink>
        </li>
        <li>
          <RouterLink to="/terms-and-conditions"
            >Şartlar ve Koşullar</RouterLink
          >
        </li>
        <li>
          <RouterLink to="/contact">İletişim</RouterLink>
        </li>
      </ul>
    </div>
    <div class="copyright uk-margin">
      <p>
        Bu sitenin yapımında hiçbir
        <a
          :href="'https://www.google.com/search?q=' + randomizedFunny"
          target="_blank"
          ><span class="sentence">{{ randomizedFunny }}</span></a
        >
        zarar görmemiştir. <br />Tüm hakları saklıdır &copy; {{ year }}
      </p>
    </div>
  </div>
</template>
