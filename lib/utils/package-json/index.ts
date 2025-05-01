import { createSyncFn } from "synckit";
import { createRequire } from "module";

export const syncPackageJson = createSyncFn(getWorkerPath()) as (
  name: string,
) => // @ts-expect-error -- cjs/esm
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- cjs/esm
import("package-json").AbbreviatedMetadata;

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
  return r.resolve("./worker.mts");
}
