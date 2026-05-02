import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  server: {
    allowedHosts: ["makeover-reach-reveler.ngrok-free.dev"],
  },
});
