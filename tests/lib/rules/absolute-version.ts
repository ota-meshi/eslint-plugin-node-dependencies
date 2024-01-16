import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/absolute-version";

import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("absolute-version", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "devDependencies": {
                    "h": "http://asdf.com/asdf.tar.gz",
                    "i": "latest",
                    "j": "file:.",
                }
            }
            `,
      options: ["never"],
    },
    {
      filename: "package.json",
      code: `
            {
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
                "dependencies": { "foo": "1.0.0" },
                "peerDependencies": { "bar": "1.0.0" },
                "optionalDependencies": { "baz": "1.0.0" },
                "devDependencies": { "qux": "1.0.0" }
            }
            `,
      options: ["always"],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" },
                "peerDependencies": { "bar": "^1.0.0" },
                "optionalDependencies": { "baz": "^1.0.0" },
                "devDependencies": { "qux": "^1.0.0" }
            }
            `,
      options: ["never"],
    },
    {
      filename: "package.json",
      code: `
            {
                "devDependencies": {
                    "a": "1.0.0",
                    "b": "=1.0.0",
                    "c": "v1.0.0",
                    "d": "1.0.0 || 2.0.0",
                    "e": "1.0.0 2.0.0",
                    "f": "1.0.0 || 1.0.0",
                    "g": "1.0.0 1.0.0",
                    "h": "http://asdf.com/asdf.tar.gz",
                    "i": "latest",
                    "j": "file:.",
                }
            }
            `,
      options: ["always"],
    },
    {
      filename: "package.json",
      code: `
            {
                "devDependencies": {
                    "a": "^1.0.0",
                    "b": "~1.0.0",
                    "c": ">1.0.0",
                    "d": ">=1.0.0",
                    "e": "^1.0.0 <2.0.0",
                    "f": "^1.0.0 || <=1.0.0",
                    "g": "1",
                    "h": "1.0",
                    "i": "1.x",
                    "j": "1.0.x",
                    "k": "*",
                    "l": "http://asdf.com/asdf.tar.gz",
                    "m": "latest",
                    "n": "file:.",


                    "valid-if-non-absolute-exists": "1.0.0 || >2.0.0"
                }
            }
            `,
      options: ["never"],
    },
  ],
  invalid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" },
                "peerDependencies": { "bar": "^1.0.0" },
                "optionalDependencies": { "baz": "^1.0.0" },
                "devDependencies": { "qux": "^1.0.0" }
            }
            `,
      errors: [
        {
          message: "Use the absolute version instead.",
          line: 6,
          column: 45,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" },
                "peerDependencies": { "bar": "^1.0.0" },
                "optionalDependencies": { "baz": "^1.0.0" },
                "devDependencies": { "qux": "^1.0.0" }
            }
            `,
      options: ["always"],
      errors: [
        {
          message: "Use the absolute version instead.",
          line: 3,
          column: 42,
        },
        {
          message: "Use the absolute version instead.",
          line: 4,
          column: 46,
        },
        {
          message: "Use the absolute version instead.",
          line: 5,
          column: 50,
        },
        {
          message: "Use the absolute version instead.",
          line: 6,
          column: 45,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "1.0.0" },
                "peerDependencies": { "bar": "1.0.0" },
                "optionalDependencies": { "baz": "1.0.0" },
                "devDependencies": { "qux": "1.0.0" }
            }
            `,
      options: ["never"],
      errors: [
        {
          message: "Do not use the absolute version.",
          line: 3,
          column: 42,
        },
        {
          message: "Do not use the absolute version.",
          line: 4,
          column: 46,
        },
        {
          message: "Do not use the absolute version.",
          line: 5,
          column: 50,
        },
        {
          message: "Do not use the absolute version.",
          line: 6,
          column: 45,
        },
      ],
    },
    {
      filename: "package.json",
      code: `{ "dependencies": { "line1": "^1.0.0",
                    "line2": "~1.0.0",
                    "line3": ">1.0.0",
                    "line4": ">=1.0.0",
                    "line5": "^1.0.0 <2.0.0",
                    "line6": "^1.0.0 || <=1.0.0",
                    "line7": "1",
                    "line8": "1.0",
                    "line9": "1.x",
                    "line10": "1.0.x",
                    "line11": "*"
                }
            }
            `,
      options: ["always"],
      errors: 11,
    },
    {
      filename: "package.json",
      code: `{ "dependencies": { "line1": "1.0.0",
                    "line2": "=1.0.0",
                    "line3": "v1.0.0",
                    "line4": "1.0.0 || 2.0.0",
                    "line5": "1.0.0 2.0.0",
                    "line6": "1.0.0 || 1.0.0",
                    "line7": "1.0.0 1.0.0"
                }
            }
            `,
      options: ["never"],
      errors: 7,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "line4": "^1.0.0",
                    "line5": "1.0.0"
                },
                "peerDependencies": {
                    "line8": "^1.0.0",
                    "line9": "1.0.0"
                },
                "optionalDependencies": {
                    "line12": "^1.0.0",
                    "line13": "1.0.0"
                },
                "devDependencies": {
                    "line16": "^1.0.0",
                    "line17": "1.0.0"
                }
            }
            `,
      options: [
        {
          dependencies: "always",
          peerDependencies: "never",
          optionalDependencies: "always",
          devDependencies: "never",
        },
      ],
      errors: [
        {
          message: "Use the absolute version instead.",
          line: 4,
        },
        {
          message: "Do not use the absolute version.",
          line: 9,
        },
        {
          message: "Use the absolute version instead.",
          line: 12,
        },
        {
          message: "Do not use the absolute version.",
          line: 17,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "line4": "^1.0.0",
                    "line5": "1.0.0"
                },
                "peerDependencies": {
                    "line8": "^1.0.0",
                    "line9": "1.0.0"
                },
                "optionalDependencies": {
                    "line12": "^1.0.0",
                    "line13": "1.0.0"
                },
                "devDependencies": {
                    "line16": "^1.0.0",
                    "line17": "1.0.0"
                }
            }
            `,
      options: [
        {
          dependencies: "never",
          peerDependencies: "always",
          optionalDependencies: "ignore",
          devDependencies: "ignore",
        },
      ],
      errors: [
        {
          message: "Do not use the absolute version.",
          line: 5,
        },
        {
          message: "Use the absolute version instead.",
          line: 8,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "line4": "^1.0.0",
                    "line5": "1.0.0"
                },
                "peerDependencies": {
                    "line8": "^1.0.0",
                    "line9": "1.0.0"
                },
                "optionalDependencies": {
                    "line12": "^1.0.0",
                    "line13": "1.0.0"
                },
                "devDependencies": {
                    "line16": "^1.0.0",
                    "line17": "1.0.0"
                }
            }
            `,
      options: [
        {
          dependencies: "never",
          peerDependencies: "always",
          optionalDependencies: "ignore",
          devDependencies: "ignore",
          overridePackages: {
            line17: "never",
          },
        },
      ],
      errors: [
        {
          message: "Do not use the absolute version.",
          line: 5,
        },
        {
          message: "Use the absolute version instead.",
          line: 8,
        },
        {
          message: "Do not use the absolute version.",
          line: 17,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                },
                "peerDependencies": {
                    "a": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                },
                "optionalDependencies": {
                    "a": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                },
                "devDependencies": {
                    "a": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                }
            }
            `,
      options: [
        {
          dependencies: "always",
          peerDependencies: "always",
          optionalDependencies: "always",
          devDependencies: "always",
          overridePackages: {
            b: {
              dependencies: "never",
              peerDependencies: "never",
              optionalDependencies: "never",
              devDependencies: "never",
            },
          },
        },
      ],
      errors: [
        {
          message: "Use the absolute version instead.",
          line: 4,
        },
        {
          message: "Use the absolute version instead.",
          line: 9,
        },
        {
          message: "Use the absolute version instead.",
          line: 14,
        },
        {
          message: "Use the absolute version instead.",
          line: 19,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "A": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                },
                "peerDependencies": {
                    "A": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                },
                "optionalDependencies": {
                    "A": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                },
                "devDependencies": {
                    "A": "^1.0.0",
                    "b": "^1.0.0",
                    "c": "1.0.0"
                }
            }
            `,
      options: [
        {
          dependencies: "ignore",
          peerDependencies: "ignore",
          optionalDependencies: "ignore",
          devDependencies: "ignore",
          overridePackages: {
            "/^[ab]$/i": "always",
          },
        },
      ],
      errors: [
        {
          message: "Use the absolute version instead.",
          line: 4,
        },
        {
          message: "Use the absolute version instead.",
          line: 5,
        },
        {
          message: "Use the absolute version instead.",
          line: 9,
        },
        {
          message: "Use the absolute version instead.",
          line: 10,
        },
        {
          message: "Use the absolute version instead.",
          line: 14,
        },
        {
          message: "Use the absolute version instead.",
          line: 15,
        },
        {
          message: "Use the absolute version instead.",
          line: 19,
        },
        {
          message: "Use the absolute version instead.",
          line: 20,
        },
      ],
    },
  ],
});
