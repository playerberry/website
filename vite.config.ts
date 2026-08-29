import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { rss } from "./plugins/rss.ts";
import { sitemap } from "./plugins/sitemap.ts";
import { prerender } from "./plugins/prerender.ts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), rss(), sitemap(), prerender()],
  base: "/",
  // Pin the dev server (and preview) to a fixed port; fail rather than
  // silently fall back to another port if 8086 is already taken.
  server: {
    port: 8086,
    strictPort: true,
  },
  preview: {
    port: 8086,
    strictPort: true,
  },
});
