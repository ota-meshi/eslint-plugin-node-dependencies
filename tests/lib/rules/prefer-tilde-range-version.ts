import { RuleTester } from "eslint";
import rule from "../../../lib/rules/prefer-tilde-range-version.ts";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("prefer-tilde-range-version", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=6.1"
                },
                "dependencies": { "a": "~1.0.0", "b": "^1.0.0" },
                "peerDependencies": { "c": "~1.0.0", "d": "^1.0.0" },
                "optionalDependencies": { "e": "~1.0.0", "f": "1.0.0" },
                "devDependencies": { "g": "~1.0.0" }
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
                    "a": "1.2.3 - 1",
                    "b": "1.2.3 - 1.2.4"
                }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "1.2.x",
                    "b": "1.2.*"
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
                    "a": "~1.0.0",
                
                    /* ✗ BAD */
                    "b": ">=1.0.0 <1.1.0",
                    "c": ">=0.1.0 <0.2.0",
                    "e": "1.2.3 - 1.2"
                },
            }
            `,
      output: `
            {
                "dependencies": {
                    /* ✓ GOOD */
                    "a": "~1.0.0",
                
                    /* ✗ BAD */
                    "b": "~1.0.0",
                    "c": "~0.1.0",
                    "e": "~1.2.3"
                },
            }
            `,
      errors: [
        {
          message: "Use '~1.0.0' syntax instead.",
          line: 8,
        },
        {
          message: "Use '~0.1.0' syntax instead.",
          line: 9,
        },
        {
          message: "Use '~1.2.3' syntax instead.",
          line: 10,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "10.10 || ~12.12 || 14 || >=16"
                },
                "dependencies": {
                    "a": ">=1.2.3 <1.3.1",
                    "b": "<1.3.0-0 >=1.2.3",
                    "c": "1.1.0 || >=1.2.3 <1.3.0-0",
                    "d": ">=2.2.3 <2.3.0"
                },
                "peerDependencies": {
                    "e": ">=0.2.3 <0.2.4",
                    "f": ">=0.2.3-4 <0.2.3-5",
                    "g": ">=0.0.3 <0.0.4-0"
                }
            }
            `,
      output: `
            {
                "engines": {
                    "node": "10.10 || ~12.12 || 14 || >=16"
                },
                "dependencies": {
                    "a": ">=1.2.3 <1.3.1",
                    "b": "~1.2.3",
                    "c": "1.1.0 || ~1.2.3",
                    "d": "~2.2.3"
                },
                "peerDependencies": {
                    "e": ">=0.2.3 <0.2.4",
                    "f": ">=0.2.3-4 <0.2.3-5",
                    "g": ">=0.0.3 <0.0.4-0"
                }
            }
            `,
      errors: [
        {
          message: "Use '~1.2.3' syntax instead.",
          line: 8,
        },
        {
          message: "Use '~1.2.3' syntax instead.",
          line: 9,
        },
        {
          message: "Use '~2.2.3' syntax instead.",
          line: 10,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "1.1.x || <1.2.3-1 >=1.2.3"
                },
                "optionalDependencies": {
                    "b": ">=0.3.0-beta <0.4.0-0",
                    "c": "1.2"
                },
                "devDependencies": {
                    "d": "1.2.4-x",
                    "e": "1.2.3 - 1.2",
                    "f": "1.2.3 - 1.2.x"
                }
            }
            `,
      output: `
            {
                "dependencies": {
                    "a": "1.1.x || <1.2.3-1 >=1.2.3"
                },
                "optionalDependencies": {
                    "b": "~0.3.0-beta",
                    "c": "1.2"
                },
                "devDependencies": {
                    "d": "1.2.4-x",
                    "e": "~1.2.3",
                    "f": "~1.2.3"
                }
            }
            `,
      errors: [
        {
          message: "Use '~0.3.0-beta' syntax instead.",
          line: 7,
        },
        {
          message: "Use '~1.2.3' syntax instead.",
          line: 12,
        },
        {
          message: "Use '~1.2.3' syntax instead.",
          line: 13,
        },
      ],
    },
  ],
});
