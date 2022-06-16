import path from "path"
import assert from "assert"
import { ESLint } from "eslint"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("Integration with eslint-plugin-node-dependencies", () => {
    if (!ESLint) {
        return
    }
    it("should lint without errors", async () => {
        const engine = new ESLint({
            cwd: TEST_CWD,
            plugins: {
                "eslint-plugin-node-dependencies": plugin as never,
            },
        })
        const results = await engine.lintFiles(["package.json"])

        assert.strictEqual(results.length, 1)
        assert.deepStrictEqual(
            results[0].messages.map((m) => m.ruleId),
            ["node-dependencies/compat-engines"],
        )
    })
})
