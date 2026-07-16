/**
 * ESLint flat config for the PlayerBerry site.
 *
 * Layers, in order: core JS recommendations, TypeScript recommendations,
 * Vue 3 recommendations (flat preset), Prettier compatibility (turns off
 * formatting rules — the codebase is Prettier-formatted), then a project
 * layer that points the Vue SFC parser at the TypeScript parser and declares
 * browser globals.
 */
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import prettierCompat from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  prettierCompat,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      // Ambient declarations for untyped third-party modules (UIkit) have no
      // real types to point at.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Single-word view/section names (Header, Footer, Icon…) are a
      // deliberate naming convention in this codebase.
      "vue/multi-word-component-names": "off",
    },
  },
);
