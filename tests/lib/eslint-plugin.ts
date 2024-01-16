import path from "path";
import assert from "assert";
import { getLegacyESLint } from "eslint-compat-utils/eslint";
import plugin from "../../lib/index";
// eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
const ESLint = getLegacyESLint();

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-node-dependencies", () => {
  if (!ESLint) {
    return;
  }
  it("should lint without errors", async () => {
    const engine = new ESLint({
      cwd: TEST_CWD,
      plugins: {
        "eslint-plugin-node-dependencies": plugin as never,
      },
    });
    const results = await engine.lintFiles(["package.json"]);

    assert.strictEqual(results.length, 1);
    assert.deepStrictEqual(
      results[0].messages.map((m) => m.ruleId),
      ["node-dependencies/compat-engines"],
    );
  });
});
