import { createSyncFn } from "synckit";
import { createRequire } from "module";

export const syncPackageJson =
  // @ts-expect-error -- cjs/esm
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- cjs/esm
  createSyncFn<typeof import("package-json").default>(getWorkerPath());

/**
 * Get the worker module path
 */
function getWorkerPath(): string {
  try {
    return require.resolve("./worker.mjs");
  } catch {
    // ignore
  }
  // Running on vitepress config
  const r = createRequire(__filename);
  return r.resolve(`./worker.mts`);
}
