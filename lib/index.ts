import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import { recommendedConfig as flatRecommended } from "./configs/flat/recommended";
import * as meta from "./meta";
import type { Linter } from "eslint";

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
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
// @ts-ignore -- Backwards compatibility
export = {
  meta,
  configs,
  rules,
};
