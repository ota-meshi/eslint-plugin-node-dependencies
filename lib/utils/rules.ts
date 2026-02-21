import type { RuleModule } from "../types.ts";
import absoluteVersion from "../rules/absolute-version.ts";
import compatEngines from "../rules/compat-engines.ts";
import noDeprecated from "../rules/no-deprecated.ts";
import noDupeDeps from "../rules/no-dupe-deps.ts";
import noRestrictedDeps from "../rules/no-restricted-deps.ts";
import preferCaretRangeVersion from "../rules/prefer-caret-range-version.ts";
import preferTildeRangeVersion from "../rules/prefer-tilde-range-version.ts";
import requireProvenanceDeps from "../rules/require-provenance-deps.ts";
import validEngines from "../rules/valid-engines.ts";
import validSemver from "../rules/valid-semver.ts";

export const rules = [
  absoluteVersion,
  compatEngines,
  noDeprecated,
  noDupeDeps,
  noRestrictedDeps,
  preferCaretRangeVersion,
  preferTildeRangeVersion,
  requireProvenanceDeps,
  validEngines,
  validSemver,
] as RuleModule[];
