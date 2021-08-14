import { RuleTester } from "eslint"
import rule from "../../../lib/rules/valid-engines"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
})

tester.run("valid-engines", rule as any, {
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
    ],
    invalid: [],
})
