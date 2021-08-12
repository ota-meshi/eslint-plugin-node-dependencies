import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-deprecated"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
})

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
})
