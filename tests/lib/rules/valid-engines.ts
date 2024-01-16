import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/valid-engines";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("valid-engines", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=12"
                },
                "dependencies": {
                    "semver": "^7.3.5"
                }
            }
            `,
    },
  ],
  invalid: [],
});
