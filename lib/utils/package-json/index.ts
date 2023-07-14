import { createSyncFn } from "synckit";
import type { AbbreviatedMetadata, Options } from "package-json";
type SyncPackageJson = (
  packageName: string,
  options: Options,
) => AbbreviatedMetadata;

export const syncPackageJson: SyncPackageJson = createSyncFn(
  require.resolve("./worker"),
);
