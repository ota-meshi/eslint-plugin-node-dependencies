import type { RuleModule } from "../types"
import absoluteVersion from "../rules/absolute-version"
import compatEngines from "../rules/compat-engines"
import noDeprecated from "../rules/no-deprecated"
import noDupeDeps from "../rules/no-dupe-deps"
import noRestrictedDeps from "../rules/no-restricted-deps"
import preferCaretRangeVersion from "../rules/prefer-caret-range-version"
import preferTildeRangeVersion from "../rules/prefer-tilde-range-version"
import validEngines from "../rules/valid-engines"
import validSemver from "../rules/valid-semver"

export const rules = [
    absoluteVersion,
    compatEngines,
    noDeprecated,
    noDupeDeps,
    noRestrictedDeps,
    preferCaretRangeVersion,
    preferTildeRangeVersion,
    validEngines,
    validSemver,
] as RuleModule[]
