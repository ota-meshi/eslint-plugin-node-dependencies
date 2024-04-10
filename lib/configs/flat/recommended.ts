import type { ESLint, Linter } from "eslint";
import recommendedRules from "../rules/recommended";
import * as jsonParser from "jsonc-eslint-parser";
export const recommendedConfig = [
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
      get "node-dependencies"(): ESLint.Plugin {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
        return require("../../index");
      },
    },
  },
  {
    files: ["**/package.json", "package.json"],
    languageOptions: {
      parser: jsonParser,
    },
    rules: recommendedRules.rules,
  },
] satisfies Linter.FlatConfig[];
