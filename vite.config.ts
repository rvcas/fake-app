import { resolve } from "node:path";
import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    allowedHosts: ["born-outside.rvcas.dev"],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
});
