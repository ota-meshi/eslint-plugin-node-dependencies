// @ts-expect-error -- I don't know how to set the tsconfig...
import { createSyncFn } from "synckit";
// @ts-expect-error -- I don't know how to set the tsconfig...
import type { AbbreviatedMetadata, Options } from "package-json";
type SyncPackageJson = (
  packageName: string,
  options: Options,
) => AbbreviatedMetadata;

export const syncPackageJson: SyncPackageJson = createSyncFn(
  require.resolve("./worker"),
);
