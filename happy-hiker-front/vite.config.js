import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/google": {
        target: "https://maps.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google/, ""),
      },
      "/api/routes": {
        target: "https://routes.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/routes/, ""),
      },
      "/api/places": {
        target: "https://places.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/places/, ""),
      },
    },
  },
})
