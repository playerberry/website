import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { rss } from "./plugins/rss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), rss()],
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
