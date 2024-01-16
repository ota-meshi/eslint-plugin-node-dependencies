import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/prefer-caret-range-version";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("prefer-caret-range-version", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=6"
                },
                "dependencies": { "a": "^1.0.0", "b": "1.0.0" },
                "peerDependencies": { "c": "^1.0.0", "d": "1.0.0" },
                "optionalDependencies": { "e": "^1.0.0", "f": "1.0.0" },
                "devDependencies": { "g": "1.0.0" }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "1.1.0 || >=1.2.3 <2.0.0-beta.4"
                }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "1.2.3 - 1.3",
                    "b": "1.2.3 - 1.2"
                }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "1.x",
                    "b": "1.*"
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
                  /* ✓ GOOD */
                  "a": "^1.0.0",

                  /* ✗ BAD */
                  "b": ">=1.0.0 <2.0.0",
                  "c": ">=0.1.0 <0.2.0",
                  "d": ">=0.0.1 <0.0.2",
                  "e": "1.2.3 - 1",
                  "f": "~1",
                  "g": "~1.x"
                },
            }
            `,
      output: `
            {
                "dependencies": {
                  /* ✓ GOOD */
                  "a": "^1.0.0",

                  /* ✗ BAD */
                  "b": "^1.0.0",
                  "c": "^0.1.0",
                  "d": "^0.0.1",
                  "e": "^1.2.3",
                  "f": "^1.0.0",
                  "g": "^1.0.0"
                },
            }
            `,
      errors: [
        {
          message: "Use '^1.0.0' syntax instead.",
          line: 8,
        },
        {
          message: "Use '^0.1.0' syntax instead.",
          line: 9,
        },
        {
          message: "Use '^0.0.1' syntax instead.",
          line: 10,
        },
        {
          message: "Use '^1.2.3' syntax instead.",
          line: 11,
        },
        {
          message: "Use '^1.0.0' syntax instead.",
          line: 12,
        },
        {
          message: "Use '^1.0.0' syntax instead.",
          line: 13,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "~10 || 12 || >=16"
                },
                "dependencies": {
                    "a": ">=1.2.3 <2.0.1",
                    "b": "<2.0.0-0 >=1.2.3",
                    "c": "1.1.0 || >=1.2.3 <2.0.0-0",
                    "d": ">=2.2.3 <3.0.0"
                },
                "peerDependencies": {
                    "e": ">=0.2.3 <0.3.0-0",
                    "f": ">=0.0.3 <0.0.4-0"
                }
            }
            `,
      output: `
            {
                "engines": {
                    "node": "^10.0.0 || 12 || >=16"
                },
                "dependencies": {
                    "a": ">=1.2.3 <2.0.1",
                    "b": "^1.2.3",
                    "c": "1.1.0 || ^1.2.3",
                    "d": "^2.2.3"
                },
                "peerDependencies": {
                    "e": "^0.2.3",
                    "f": "^0.0.3"
                }
            }
            `,
      errors: [
        {
          message: "Use '^10.0.0' syntax instead.",
          line: 4,
        },
        {
          message: "Use '^1.2.3' syntax instead.",
          line: 8,
        },
        {
          message: "Use '^1.2.3' syntax instead.",
          line: 9,
        },
        {
          message: "Use '^2.2.3' syntax instead.",
          line: 10,
        },
        {
          message: "Use '^0.2.3' syntax instead.",
          line: 13,
        },
        {
          message: "Use '^0.0.3' syntax instead.",
          line: 14,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "1.x || <2.0.1 >=1.2.3"
                },
                "optionalDependencies": {
                    "b": ">=0.0.3-beta <0.0.4-0",
                    "c": "~1"
                },
                "devDependencies": {
                    "d": "~0.2",
                    "e": "1.2.3 - 1",
                    "f": "1.2.3 - 1.x"
                }
            }
            `,
      output: `
            {
                "dependencies": {
                    "a": "1.x || <2.0.1 >=1.2.3"
                },
                "optionalDependencies": {
                    "b": "^0.0.3-beta",
                    "c": "^1.0.0"
                },
                "devDependencies": {
                    "d": "^0.2.0",
                    "e": "^1.2.3",
                    "f": "^1.2.3"
                }
            }
            `,
      errors: [
        {
          message: "Use '^0.0.3-beta' syntax instead.",
          line: 7,
        },
        {
          message: "Use '^1.0.0' syntax instead.",
          line: 8,
        },
        {
          message: "Use '^0.2.0' syntax instead.",
          line: 11,
        },
        {
          message: "Use '^1.2.3' syntax instead.",
          line: 12,
        },
        {
          message: "Use '^1.2.3' syntax instead.",
          line: 13,
        },
      ],
    },
  ],
});
