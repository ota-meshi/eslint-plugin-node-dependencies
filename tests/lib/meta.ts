import assert from "node:assert";
import plugin from "../../lib/index.ts";
import { version } from "../../package.json";
const expectedMeta = {
  name: "eslint-plugin-node-dependencies",
  version,
};

describe("Test for meta object", () => {
  it("A plugin should have a meta object.", () => {
    assert.strictEqual(plugin.meta.name, expectedMeta.name);
    assert.strictEqual(typeof plugin.meta.version, "string");
  });
});
