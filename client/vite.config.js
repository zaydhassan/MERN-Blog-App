import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Migrated from Create React App. Notes:
//  - CRA uses .js for JSX; Vite treats .js as plain JS by default. The esbuild
//    loader config below parses JSX in .js so we don't have to rename every
//    component file. (optimizeDeps does the same for pre-bundled deps.)
//  - build.outDir is "build" (CRA's default) so the Express server's
//    `express.static("../client/build")` + SPA fallback keep working unchanged.
//  - The dev proxy replaces CRA's `proxy` field, forwarding /api and /uploads
//    to the backend so the refresh-token cookie (SameSite=Lax) works in dev.
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  define: {
    // React branches on this; make sure the production build strips dev code.
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
  },
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/uploads": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  build: {
    outDir: "build",
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split vendor code into stable chunks so app-code changes don't
        // invalidate the (large) dependency cache. Grouped by ecosystem to
        // keep related deps together and avoid cross-chunk churn.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (id.includes("firebase")) return "firebase";
          if (id.includes("quill")) return "editor";
          // Heavy page-specific libs: split out of the core vendor chunk so
          // they're only downloaded by the pages that actually use them.
          if (id.includes("chart.js") || id.includes("chartjs")) return "charts";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("sweetalert2")) return "sweetalert";
          if (id.includes("react-speech-recognition")) return "speech";
          return "vendor";
        },
      },
    },
  },
});