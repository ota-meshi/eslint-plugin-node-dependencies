import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-dupe-deps"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
})

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
})
