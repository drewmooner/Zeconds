import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const dayjsEsm = path.resolve(root, "node_modules/dayjs/esm/index.js");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@reown/appkit/react",
        replacement: path.resolve(root, "node_modules/@reown/appkit/dist/esm/exports/react.js"),
      },
      {
        find: "@reown/appkit/networks",
        replacement: path.resolve(root, "node_modules/@reown/appkit/dist/esm/exports/networks.js"),
      },
      { find: /^dayjs$/, replacement: dayjsEsm },
    ],
  },
  optimizeDeps: {
    include: ["dayjs"],
    needsInterop: ["dayjs"],
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
