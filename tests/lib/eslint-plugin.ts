import path from "path";
import assert from "assert";
import { getLegacyESLint } from "eslint-compat-utils/eslint";
import * as eslintModule from "eslint";
import plugin from "../../lib/index";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD_FOR_FLAT_CONFIG = path.join(
  __dirname,
  "../fixtures/integrations/eslint-plugin",
);
const TEST_CWD_FOR_LEGACY_CONFIG = path.join(
  __dirname,
  "../fixtures/integrations/eslint-plugin-legacy-config",
);

describe("Integration with eslint-plugin-node-dependencies", async () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  const FlatESLint: typeof eslintModule.ESLint =
    // @ts-expect-error -- new API
    typeof eslintModule.loadESLint === "function"
      ? // @ts-expect-error -- new API
        await eslintModule.loadESLint({ useFlatConfig: true })
      : null;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  const ESLint: typeof eslintModule.ESLint =
    // @ts-expect-error -- new API
    typeof eslintModule.loadESLint === "function"
      ? // @ts-expect-error -- new API
        await eslintModule.loadESLint({ useFlatConfig: false })
      : getLegacyESLint();
  if (FlatESLint) {
    it("should lint without errors (with flat config)", async () => {
      const eslint = new FlatESLint({
        cwd: TEST_CWD_FOR_FLAT_CONFIG,
      });
      const results = await eslint.lintFiles(["package.json"]);

      assert.strictEqual(results.length, 1);
      assert.deepStrictEqual(
        results[0].messages.map((m) => m.ruleId),
        ["node-dependencies/compat-engines"],
      );
    });
  }
  if (ESLint) {
    it("should lint without errors (with legacy config)", async () => {
      const engine = new ESLint({
        cwd: TEST_CWD_FOR_LEGACY_CONFIG,
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
  }
});
