import { createSyncFn } from "synckit";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AbbreviatedMetadata } from "package-json";

export const syncPackageJson = createSyncFn(getWorkerPath(), {
  timeout: 10_000,
}) as (name: string) => AbbreviatedMetadata;

/**
 * Get the worker module path
 */
function getWorkerPath(): string {
  const ext = path.extname(fileURLToPath(import.meta.url));
  try {
    return fileURLToPath(import.meta.resolve(`./worker${ext}`));
  } catch {
    // ignore
  }
  // Running on vitepress config
  const r = createRequire(import.meta.url);
  return r.resolve(`./worker${ext}`);
}
