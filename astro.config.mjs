import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://libretta.app",
  trailingSlash: "always",
  build: { format: "directory" },
});
