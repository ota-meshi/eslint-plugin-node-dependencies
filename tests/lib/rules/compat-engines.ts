import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/compat-engines";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("compat-engines", rule as any, {
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
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "dependencies": {
                    "semver": "^6"
                }
            }
            `,
    },
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
      options: [{ deep: false }],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "semver": "^7.3.5"
                }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "^12.20.0 || ^14.14.0 || >=16"
                },
                "peerDependencies": {
                    "eslint": "^7.0.0",
                    "eslint-plugin-regexp": ">=0.13.0 <1.0.0",
                    "eslint-plugin-eslint-comments": "^3.2.0"
                },
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "peerDependencies": {
                    "eslint": ">=4"
                },
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "^10 || ^12 || >=14"
                },
                "peerDependencies": {
                    "eslint": ">=6.0.0"
                }
            }`,
      options: [{ comparisonType: "major" }],
    },
    {
      filename: "package.json",
      code: `42`,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": 42,
                "peerDependencies": {
                    "eslint": ">=6.0.0"
                }
            }`,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": 42
                },
                "peerDependencies": {
                    "eslint": ">=6.0.0"
                }
            }`,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "latest"
                },
                "peerDependencies": {
                    "eslint": ">=6.0.0"
                }
            }`,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=6"
                },
                "peerDependencies": {
                    "eslint": 7
                }
            }`,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=6"
                },
                "peerDependencies": {
                    "eslint": "foo"
                }
            }`,
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=16"
                },
                "peerDependencies": {
                    "vue": "^3"
                }
            }`,
    },
  ],
  invalid: [
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "dependencies": {
                    "semver": "^7.3.5"
                }
            }
            `,
      errors: [
        {
          message:
            '"semver@^7.3.5" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
          line: 7,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "dependencies": {
                    "semver": "7.3.5"
                }
            }
            `,
      errors: [
        {
          message:
            '"semver@7.3.5" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
          line: 7,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "peerDependencies": {
                    "semver": "^7.3.5"
                }
            }
            `,
      errors: [
        {
          message:
            '"semver@^7.3.5" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
          line: 7,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "dependencies": {
                    "semver": "^7.3.5"
                }
            }
            `,
      options: [{ deep: true }],
      errors: [
        '"semver@^7.3.5" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "dependencies": {
                    "semver": "latest"
                }
            }
            `,
      errors: [
        '"semver@latest" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8.0"
                },
                "dependencies": {
                    "express": "expressjs/express",
                    "mocha": "mochajs/mocha#4727d357ea"
                }
            }
            `,
      errors: [
        `"mocha@mochajs/mocha#4727d357ea" is not compatible with "node@>=8.0.0". Allowed is: "node@^18.18.0||^20.9.0||>=21.1.0"`,
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8"
                },
                "peerDependencies": {
                    "eslint": "^7.0.0",
                    "eslint-plugin-regexp": ">=0.13.0 <1.0.0",
                    "eslint-plugin-eslint-comments": "^3.2.0"
                },
            }
            `,
      errors: [
        {
          message:
            '"eslint@^7.0.0" is not compatible with "node@>=8.0.0". Allowed is: "node@^10.12.0||>=12.0.0"',
          line: 7,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "comment-parser@^1.1.2" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
          line: 8,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "eslint@>=6.0.0" is not compatible with "node@>=8.0.0". Allowed is: "node@^8.10.0||^10.12.0||>=11.10.1"',
          line: 8,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "eslint-utils@^3.0.0" is not compatible with "node@>=8.0.0". Allowed is: "node@^10.0.0||^12.0.0||>=14.0.0"',
          line: 8,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "jsdoctypeparser@^9.0.0" is not compatible with "node@>=8.0.0". Allowed is: "node@>=10.0.0"',
          line: 8,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": ">=8.10"
                },
                "peerDependencies": {
                    "eslint": "^7.0.0",
                    "eslint-plugin-regexp": ">=0.13.0 <1.0.0",
                    "eslint-plugin-eslint-comments": "^3.2.0"
                },
            }
            `,
      errors: [
        {
          message:
            '"eslint@^7.0.0" is not compatible with "node@>=8.10.0". Allowed is: "node@^10.12.0||>=12.0.0"',
          line: 7,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "comment-parser@^1.1.2" is not compatible with "node@>=8.10.0". Allowed is: "node@>=10.0.0"',
          line: 8,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "eslint-utils@^3.0.0" is not compatible with "node@>=8.10.0". Allowed is: "node@^10.0.0||^12.0.0||>=14.0.0"',
          line: 8,
          column: 21,
        },
        {
          message:
            '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "jsdoctypeparser@^9.0.0" is not compatible with "node@>=8.10.0". Allowed is: "node@>=10.0.0"',
          line: 8,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "^10 || ^12 || >=14"
                },
                "peerDependencies": {
                    "eslint": ">=6.0.0"
                }
            }`,
      errors: [
        {
          message:
            '"eslint@>=6.0.0" is not compatible with "node@^10.0.0||^12.0.0||>=14.0.0". Allowed is: "node@^8.10.0||^10.12.0||>=11.10.1"',
          line: 7,
          column: 21,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "^10 || ^12 || >=14"
                },
                "peerDependencies": {
                    "eslint6": "npm:eslint@^6"
                }
            }`,
      errors: [
        {
          message:
            '"eslint6@npm:eslint@^6" is not compatible with "node@^10.0.0||^12.0.0||>=14.0.0". Allowed is: "node@^8.10.0||^10.13.0||>=11.10.1"',
          line: 7,
          column: 21,
        },
      ],
    },
  ],
});
