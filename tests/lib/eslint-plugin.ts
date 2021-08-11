import path from "path"
import assert from "assert"
import { CLIEngine } from "eslint"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("Integration with eslint-plugin-node-dependencies", () => {
    it("should lint without errors", () => {
        const engine = new CLIEngine({
            cwd: TEST_CWD,
        })
        engine.addPlugin("eslint-plugin-node-dependencies", plugin)
        const r = engine.executeOnFiles(["package.json"])

        assert.strictEqual(r.results.length, 1)
        assert.deepStrictEqual(
            r.results[0].messages.map((m) => m.ruleId),
            ["node-dependencies/valid-engines"],
        )
    })
})
