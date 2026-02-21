import type { ESLint, Linter } from "eslint";
import recommendedRules from "../rules/recommended.ts";
import * as jsonParser from "jsonc-eslint-parser";
import plugin from "../../index.ts";
export const recommendedConfig = [
  {
    plugins: {
      get "node-dependencies"(): ESLint.Plugin {
        return plugin;
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
] satisfies Linter.Config[];
