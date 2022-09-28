import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8837,
    proxy: {
      "/alipay": {
        target: "https://gw.alipayobjects.com", // 实际请求地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/alipay/, ""),
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
