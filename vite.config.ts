import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      name: "Maestria SGC",
      short_name: "Maestria",
      description: "Sistema de Gestão de Atividades Complementares",
      theme_color: "#1a56db",
      background_color: "#1a1f2e",
      display: "standalone",
      start_url: "/",
      icons: [
        {
          src: "/favicon.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/favicon.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/favicon.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      registerType: "autoUpdate",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
