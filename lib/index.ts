import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import { recommendedConfig as flatRecommended } from "./configs/flat/recommended";
import * as meta from "./meta";

const configs = {
  recommended: flatRecommended,
  "flat/recommended": flatRecommended,
};

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
// @ts-ignore -- Backwards compatibility
export = {
  meta,
  configs,
  rules,
};
