import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/no-deprecated";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("no-deprecated", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "@babel/eslint-parser": "^7"
                }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "devDependencies": {
                    "babel-eslint": "^10"
                }
            }
            `,
    },
  ],
  invalid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "babel-eslint": "^10"
                }
            }
            `,
      errors: [
        {
          message:
            "babel-eslint is now @babel/eslint-parser. This package will no longer receive updates.",
          line: 4,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "devDependencies": {
                    "babel-eslint": "^10"
                }
            }
            `,
      options: [{ devDependencies: true }],
      errors: [
        {
          message:
            "babel-eslint is now @babel/eslint-parser. This package will no longer receive updates.",
          line: 4,
          column: 21,
        },
      ],
    },
  ],
});
