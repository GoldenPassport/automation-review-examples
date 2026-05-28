import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath } from "node:url";

/**
 * Vite config for the LangGraph triage UI.
 *
 * Browser compatibility plumbing for LangGraph:
 *
 *   1. nodePolyfills shims the Node built-ins (`node:crypto`, `process`,
 *      `Buffer`, etc.) that @langchain/langgraph and its transitive deps
 *      reach for.
 *
 *   2. The resolve.alias entries below redirect `node:async_hooks` and
 *      `async_hooks` to a hand-written no-op shim. LangGraph uses
 *      AsyncLocalStorage to thread trace context for LangSmith; the demo
 *      does not use LangSmith, so a no-op is safe.
 *
 * The /api/ollama proxy forwards browser requests to a locally-running
 * Ollama instance (default port 11434). This avoids CORS and keeps the
 * model URL out of the browser bundle.
 */
const asyncHooksShim = fileURLToPath(
  new URL("./src/shims/async-hooks.ts", import.meta.url),
);

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: [
      { find: /^node:async_hooks$/, replacement: asyncHooksShim },
      { find: /^async_hooks$/, replacement: asyncHooksShim },
    ],
  },
  server: {
    proxy: {
      "/api/ollama": {
        target: "http://localhost:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ""),
      },
    },
  },
  optimizeDeps: {
    // Force Vite to re-bundle these so the alias picks up on first load
    // rather than after a refresh.
    include: ["@langchain/langgraph", "@langchain/core", "@langchain/ollama"],
  },
});
