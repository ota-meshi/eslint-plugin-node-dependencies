import path from "path";
import assert from "assert";
import * as eslintModule from "eslint";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-node-dependencies", async () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  const FlatESLint: typeof eslintModule.ESLint =
    await eslintModule.loadESLint();
  if (FlatESLint) {
    it("should lint without errors (with flat config)", async () => {
      const eslint = new FlatESLint({
        cwd: TEST_CWD,
      });
      const results = await eslint.lintFiles(["package.json"]);

      assert.strictEqual(results.length, 1);
      assert.deepStrictEqual(
        results[0].messages.map((m) => m.ruleId),
        ["node-dependencies/compat-engines"],
      );
    });
  }
});
