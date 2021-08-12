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
                        '"semver@^7.3.5" is not compatible with "node@>=8". Allowed is: "node@>=10"',
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
                        '"semver@^7.3.5" is not compatible with "node@>=8". Allowed is: "node@>=10"',
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
                '"semver@^7.3.5" is not compatible with "node@>=8". Allowed is: "node@>=10"',
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
                '"semver@latest" is not compatible with "node@>=8". Allowed is: "node@>=10"',
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
                '"mocha@mochajs/mocha#4727d357ea" is not compatible with "node@>=8.0". Allowed is: "node@>=12.0.0"',
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
                        '"eslint@^7.0.0" is not compatible with "node@>=8". Allowed is: "node@^10.12.0 ||>=12.0.0"',
                    line: 7,
                    column: 21,
                },
                {
                    message:
                        '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "comment-parser@^1.1.2" is not compatible with "node@>=8". Allowed is: "node@^12.20 ||^14.14.0 || ^16"',
                    line: 8,
                    column: 21,
                },
                {
                    message:
                        '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "eslint-utils@^3.0.0" is not compatible with "node@>=8". Allowed is: "node@^10.0.0 ||^12.0.0 || >= 14.0.0"',
                    line: 8,
                    column: 21,
                },
                {
                    message:
                        '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "jsdoctypeparser@^9.0.0" is not compatible with "node@>=8". Allowed is: "node@>=10"',
                    line: 8,
                    column: 21,
                },
                {
                    message:
                        '"eslint-plugin-regexp@>=0.13.0 <1.0.0" >> "eslint@>=6.0.0" is not compatible with "node@>=8". Allowed is: "node@^10.12.0 ||>=12.0.0"',
                    line: 8,
                    column: 21,
                },
            ],
        },
    ],
})
