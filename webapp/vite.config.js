import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Относительные пути к ассетам: одна и та же сборка работает и когда её
  // раздаёт backend с корня, и когда она лежит в подпапке (GitHub Pages).
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
