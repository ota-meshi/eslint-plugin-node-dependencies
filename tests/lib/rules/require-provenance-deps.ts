import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/require-provenance-deps";
import * as jsoncParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("require-provenance-deps", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `{
      }`,
    },
    {
      filename: "package.json",
      code: `{
        "dependencies": {
          "eslint": "^9.39.0"
        }
      }`,
    },
    {
      filename: "package.json",
      code: `{
        "dependencies": {
          "babel-eslint": "^10"
        }
      }`,
      options: [{ allows: ["babel-eslint"] }],
    },
  ],
  invalid: [
    {
      filename: "package.json",
      code: `{
        "dependencies": {
          "babel-eslint": "^10"
        }
      }`,
      errors: [
        {
          messageId: "missingProvenance",
          data: {
            name: "babel-eslint",
            versions: "10.0.0 - 10.1.0",
          },
          line: 3,
          column: 11,
          endLine: 3,
          endColumn: 32,
        },
      ],
    },
    {
      filename: "package.json",
      code: `{
        "dependencies": {
          "eslint": "9.0.0 - 9.38"
        }
      }`,
      errors: [
        {
          messageId: "missingProvenance",
          data: {
            name: "eslint",
            versions: "9.0.0 - 9.38.0",
          },
          line: 3,
          column: 11,
          endLine: 3,
          endColumn: 35,
        },
      ],
    },
    {
      filename: "package.json",
      code: `{
        "devDependencies": {
          "babel-eslint": "^10"
        }
      }`,
      options: [{ devDependencies: true }],
      errors: [
        {
          messageId: "missingProvenance",
          data: {
            name: "babel-eslint",
            versions: "10.0.0 - 10.1.0",
          },
          line: 3,
          column: 11,
          endLine: 3,
          endColumn: 32,
        },
      ],
    },
  ],
});
