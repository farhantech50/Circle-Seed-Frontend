import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), flowbiteReact()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    https: {
      key: fs.readFileSync("./cert/server.key"),
      cert: fs.readFileSync("./cert/server.crt"),
    },
    proxy: {
      "/path": {
        target: "https://192.168.68.120:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/path/, ""),
      },
    },
  },
});
