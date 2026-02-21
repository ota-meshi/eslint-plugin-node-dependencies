import type { RuleModule } from "./types.ts";
import { rules as ruleList } from "./utils/rules.ts";
import { recommendedConfig as flatRecommended } from "./configs/flat/recommended.ts";
import * as meta from "./meta.ts";
import type { Linter, Rule } from "eslint";

const configs = {
  recommended: flatRecommended as Linter.Config[],
  "flat/recommended": flatRecommended as Linter.Config[],
};

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
) as { [key: string]: Rule.RuleModule };

export default { meta, configs, rules };
// Backward compatibility
export { meta, configs, rules };
