import type { Linter } from "eslint";

export default {
  rules: {
    // eslint-plugin-node-dependencies rules
    "node-dependencies/compat-engines": "error",
    "node-dependencies/no-dupe-deps": "error",
    "node-dependencies/valid-semver": "error",
  } as Linter.RulesRecord,
};
