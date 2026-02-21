import path from "node:path";
import assert from "node:assert";
import * as eslintModule from "eslint";
import { fileURLToPath } from "node:url";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_CWD = path.join(dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-node-dependencies", async () => {
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
