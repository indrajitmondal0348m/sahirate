import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (_err, _req, res) => {
            const serverRes = res as any;
            if (serverRes && !serverRes.headersSent && typeof serverRes.writeHead === "function") {
              serverRes.writeHead(503, { "Content-Type": "application/json" });
              serverRes.end(JSON.stringify({ error: "Backend server offline (port 8000)", code: "ECONNREFUSED" }));
            }
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
