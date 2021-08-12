import type { RuleModule } from "../types"
import noDeprecated from "../rules/no-deprecated"
import validEngines from "../rules/valid-engines"
import validSemver from "../rules/valid-semver"

export const rules = [noDeprecated, validEngines, validSemver] as RuleModule[]
