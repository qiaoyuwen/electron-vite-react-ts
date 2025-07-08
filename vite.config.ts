import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // 主进程入口
        entry: "src/main/main.ts",
        vite: {
          build: {
            outDir: "dist/main",
          },
        },
        onstart(options: any) {
          options.startup();
        },
      },
      {
        // 预加载脚本
        entry: "src/main/preload.ts",
        vite: {
          build: {
            outDir: "dist/main",
          },
        },
        onstart(options: any) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      "@": "/src/renderer",
    },
  },
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  build: {
    outDir: "dist/renderer",
  },
});
