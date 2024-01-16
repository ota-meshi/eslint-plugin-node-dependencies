import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/no-dupe-deps";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("no-dupe-deps", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "^1"
                },
                "peerDependencies": {
                    "b": "^1"
                },
                "optionalDependencies": {
                    "c": "^1"
                },
                "devDependencies": {
                    "d": "^1"
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
                    "a": "^1"
                },
                "peerDependencies": {
                    "a": "^1"
                },
                "optionalDependencies": {
                    "a": "^1"
                },
                "devDependencies": {
                    "a": "^1"
                }
            }
            `,
      errors: [
        {
          message: "Duplicated dependency 'a'.",
          line: 4,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 7,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 10,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 13,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "peerDependencies": {
                    "a": "^1"
                },
                "dependencies": {
                    "a": "^1"
                },
                "optionalDependencies": {
                    "a": "^1"
                },
                "devDependencies": {
                    "a": "^1"
                }
            }
            `,
      errors: [
        {
          message: "Duplicated dependency 'a'.",
          line: 4,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 7,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 10,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 13,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "^1"
                },
                "peerDependencies": {
                    "a": "^1"
                }
            }
            `,
      errors: [
        {
          message: "Duplicated dependency 'a'.",
          line: 4,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 7,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "^1"
                },
                "optionalDependencies": {
                    "a": "^1"
                }
            }
            `,
      errors: [
        {
          message: "Duplicated dependency 'a'.",
          line: 4,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 7,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "^1"
                },
                "devDependencies": {
                    "a": "^1"
                }
            }
            `,
      errors: [
        {
          message: "Duplicated dependency 'a'.",
          line: 4,
        },
        {
          message: "Duplicated dependency 'a'.",
          line: 7,
        },
      ],
    },
  ],
});
