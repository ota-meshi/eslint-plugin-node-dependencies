import type { RuleModule } from "../types"
import validEngines from "../rules/valid-engines"
import validSemver from "../rules/valid-semver"

export const rules = [validEngines, validSemver] as RuleModule[]
