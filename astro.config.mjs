import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ernestthebest.github.io",
  base: process.env.ASTRO_BASE ?? "/silku_paradize",
  output: "static",
  trailingSlash: "always",
});
