import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import recommended from "./configs/recommended";
import * as meta from "./meta";

const configs = {
  recommended,
};

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

// @ts-expect-error -- Backwards compatibility
export = {
  meta,
  configs,
  rules,
};
