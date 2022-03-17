import type { RuleModule } from "../types"
import absoluteVersion from "../rules/absolute-version"
import compatEngines from "../rules/compat-engines"
import noDeprecated from "../rules/no-deprecated"
import noDupeDeps from "../rules/no-dupe-deps"
import validEngines from "../rules/valid-engines"
import validSemver from "../rules/valid-semver"

export const rules = [
    absoluteVersion,
    compatEngines,
    noDeprecated,
    noDupeDeps,
    validEngines,
    validSemver,
] as RuleModule[]
