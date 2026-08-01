import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Long-lived vendor chunks split by purpose so route chunks stay small
    // and browsers can cache libraries independently of app code.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // Recharts + its D3 internals — the largest third-party dep.
          if (
            id.includes("recharts") ||
            id.includes("d3-") ||
            id.includes("victory-vendor") ||
            id.includes("decimal.js-light")
          ) {
            return "charts";
          }

          // lucide-react — icon set, stable and shared everywhere.
          if (id.includes("lucide-react")) return "icons";

          // React core + router — should always share one chunk.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }

          // Small shared utilities.
          if (
            id.includes("sonner") ||
            id.includes("zustand") ||
            id.includes("date-fns") ||
            id.includes("uuid") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge")
          ) {
            return "utils";
          }

          // Everything else in node_modules — one shared vendor chunk.
          return "vendor";
        },
      },
    },
  },
});
