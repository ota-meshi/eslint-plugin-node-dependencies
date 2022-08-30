import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-restricted-deps";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("no-restricted-deps", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: ["bar"],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "bar" }],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "bar", version: "^1.0.0" }],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "foo", version: "<1.0.0" }],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "foo", version: "^2.0.0" }],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "eslint-plugin-node-dependencies": "*"
                }
            }
            `,
      options: [{ package: "npm-package-arg", version: "7", deep: "local" }],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "espree": "^9.0.0"
                }
            }
            `,
      options: [
        {
          package: "eslint-visitor-keys",
          version: "^2",
          deep: "server",
        },
      ],
    },
  ],
  invalid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: ["foo"],
      errors: ["Depend on 'foo' is not allowed."],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "foo" }],
      errors: ["Depend on 'foo' is not allowed."],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "foo", version: "^1.0.0" }],
      errors: ["Depend on 'foo@^1.0.0' is not allowed."],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [{ package: "foo", version: "<=1.0.0" }],
      errors: ["Depend on 'foo@<=1.0.0' is not allowed."],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": { "foo": "^1.0.0" }
            }
            `,
      options: [
        {
          package: "foo",
          version: "<=1.0.0",
          message: "Ban 'foo@<=1.0.0'.",
        },
      ],
      errors: ["Ban 'foo@<=1.0.0'."],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "@foo/a": "^1.0.0",
                    "@bar/a": "^1.0.0",
                    "@foo/b": "^1.0.0"
                },
                "devDependencies": {
                    "@foo/c": "^1.0.0",
                    "@foo/d": "^1.0.0",
                    "@bar/b": "^1.0.0"
                }
            }
            `,
      options: [
        {
          package: "/^@foo/",
          version: "^1.0.0",
        },
      ],
      errors: [
        {
          message: "Depend on '/^@foo/ @^1.0.0' is not allowed.",
          line: 4,
        },
        {
          message: "Depend on '/^@foo/ @^1.0.0' is not allowed.",
          line: 6,
        },
        {
          message: "Depend on '/^@foo/ @^1.0.0' is not allowed.",
          line: 9,
        },
        {
          message: "Depend on '/^@foo/ @^1.0.0' is not allowed.",
          line: 10,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "@foo/a": "^1.0.0",
                    "@bar/a": "^1.0.0",
                    "@foo/b": "^1.0.0"
                },
                "devDependencies": {
                    "@foo/c": "^1.0.0",
                    "@foo/d": "^1.0.0",
                    "@bar/b": "^1.0.0"
                }
            }
            `,
      options: ["@foo/a", "@foo/b", "/bar/"],
      errors: [
        {
          message: "Depend on '@foo/a' is not allowed.",
          line: 4,
        },
        {
          message: "Depend on '/bar/' is not allowed.",
          line: 5,
        },
        {
          message: "Depend on '@foo/b' is not allowed.",
          line: 6,
        },
        {
          message: "Depend on '/bar/' is not allowed.",
          line: 11,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "@foo/a": "^1.0.0",
                    "@bar/a": "^1.0.0",
                    "@foo/b": "^1.0.0"
                },
                "devDependencies": {
                    "@foo/c": "^1.0.0",
                    "@foo/d": "^1.0.0",
                    "@bar/b": "^1.0.0"
                }
            }
            `,
      options: [
        { package: "@foo/a" },
        { package: "@foo/b", message: "Ban '@foo/b'." },
      ],
      errors: [
        {
          message: "Depend on '@foo/a' is not allowed.",
          line: 4,
        },
        {
          message: "Ban '@foo/b'.",
          line: 6,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "eslint-plugin-node-dependencies": "*"
                }
            }
            `,
      options: [{ package: "npm-package-arg", deep: "local" }],
      errors: [
        {
          message: "Depend on 'npm-package-arg' is not allowed.",
          line: 4,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "espree": "^8"
                }
            }
            `,
      options: [
        {
          package: "eslint-visitor-keys",
          version: "^3",
          deep: "server",
        },
      ],
      errors: [
        {
          message: "Depend on 'eslint-visitor-keys@^3' is not allowed.",
          line: 4,
        },
      ],
    },
  ],
});
