import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "lib/index.ts",
    worker: "lib/utils/package-json/worker.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  external: ["json-schema"],
});
