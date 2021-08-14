import type { RuleModule } from "../types"
import compatEngines from "../rules/compat-engines"
import noDeprecated from "../rules/no-deprecated"
import validEngines from "../rules/valid-engines"
import validSemver from "../rules/valid-semver"

export const rules = [
    compatEngines,
    noDeprecated,
    validEngines,
    validSemver,
] as RuleModule[]
