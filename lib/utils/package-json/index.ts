import { createSyncFn } from "synckit";
// @ts-expect-error -- I don't know how to set the tsconfig...
import type { AbbreviatedMetadata, Options } from "package-json";
import { createRequire } from "module";
type SyncPackageJson = (
  packageName: string,
  options: Options,
) => AbbreviatedMetadata;

export const syncPackageJson: SyncPackageJson = createSyncFn(getWorkerPath());

/**
 * Get the worker module path
 */
function getWorkerPath(): string {
  try {
    return require.resolve("./worker");
  } catch {
    // ignore
  }
  // Running on vitepress config
  const r = createRequire(__filename);
  return r.resolve(`./worker.ts`);
}
