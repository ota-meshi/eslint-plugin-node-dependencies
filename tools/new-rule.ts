import path from "path"
import fs from "fs"
import cp from "child_process"
const logger = console

// main
;((ruleId) => {
    if (ruleId == null) {
        logger.error("Usage: npm run new <RuleID>")
        process.exitCode = 1
        return
    }
    if (!/^[\w-]+$/u.test(ruleId)) {
        logger.error("Invalid RuleID '%s'.", ruleId)
        process.exitCode = 1
        return
    }

    const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.ts`)
    const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.ts`)
    const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`)

    fs.writeFileSync(
        ruleFile,
        `
import type { Expression } from "estree"
import { createRule } from "../utils"

export default createRule("${ruleId}", {
    meta: {
        docs: {
            description: "",
            category: "Best Practices",
            // TODO Switch to recommended in the major version.
            // recommended: true,
            recommended: false,
        },
        schema: [],
        messages: {},
        type: "suggestion", // "problem",
    },
    create(context) {
        return {

        }
    },
})
`,
    )
    fs.writeFileSync(
        testFile,
        `import { RuleTester } from "eslint"
import rule from "../../../lib/rules/${ruleId}"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
})

tester.run("${ruleId}", rule as any, {
    valid: [
        {
            filename: 'package.json',
            code: \`
            {

            }
            \`
        }
    ],
    invalid: [
        {
            filename: 'package.json',
            code: \`
            {
                
            }
            \`,
            errors: [
                {
                    messageId: "",
                    data: {},
                    line: 1,
                    column: 1,
                    endLine: 1,
                    endColumn: 1,
                },
            ],
        },
    ],
})
`,
    )
    fs.writeFileSync(
        docFile,
        `#  (node-dependencies/${ruleId})

> description

## :book: Rule Details

This rule reports ???.

<eslint-code-block>

\`\`\`js
/* eslint node-dependencies/${ruleId}: "error" */

/* ✓ GOOD */


/* ✗ BAD */

\`\`\`

</eslint-code-block>

## :wrench: Options

\`\`\`json
{
  "node-dependencies/${ruleId}": ["error", {

  }]
}
\`\`\`

-

## :books: Further reading

-

`,
    )

    cp.execSync(`code "${ruleFile}"`)
    cp.execSync(`code "${testFile}"`)
    cp.execSync(`code "${docFile}"`)
})(process.argv[2])
