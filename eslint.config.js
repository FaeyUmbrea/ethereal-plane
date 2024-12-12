import globals from "globals";
import js from "@eslint/js";
import tslint from "typescript-eslint";
import tsESLintParser from "@typescript-eslint/parser";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginSvelte from "eslint-plugin-svelte";
import svelteESLintParser from "svelte-eslint-parser";

const ignores = [
  ".DS_Store",
  "node_modules/**/*",
  "build/**/*",
  ".svelte-kit/**/*",
  "package/**/*",
  ".env",
  ".env.*",
  "package-lock.json",
  "yarn.lock",
  "dist/**/*",
  ".vite-cache/**/*",
];
export default [
  js.configs.recommended,
  ...tslint.configs.recommended,
  eslintPluginPrettierRecommended,
  ...eslintPluginSvelte.configs["flat/prettier"],
  {
    ignores: ignores,
  },
  {
    ignores,
    languageOptions: {
      globals: {
        ...globals.browser,
        game: true,
        Hooks: true,
        PIXI: true,
        Application: true,
        foundry: true,
        ui: true,
      },
    },
  },
  {
    files: ["*.ts", "*.tsx"],
    ignores,
    languageOptions: {
      sourceType: "module",
      parser: tsESLintParser,
    },
  },
  {
    files: ["**/*.svelte", "*.svelte"],
    ignores,
    languageOptions: {
      parser: svelteESLintParser,
      parserOptions: {
        // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
        extraFileExtensions: [".svelte"], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
        parser: tsESLintParser,
      },
    },
  },
];
