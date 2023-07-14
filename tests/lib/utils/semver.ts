import assert from "assert";

import {
  normalizeSemverRange,
  maxNextVersion,
} from "../../../lib/utils/semver";
import { Range, subset } from "semver";

describe("normalizeSemverRange", () => {
  const testcases = [
    {
      input: [">=10"],
      output: ">=10.0.0",
    },
    {
      input: ["^10 || ^13", "^10.12", ">=12 <12.22", ">=12.10 <12.30"],
      output: "^10.0.0||>=12.0.0 <12.30.0-0||^13.0.0",
    },
    {
      input: ["*", "^13"],
      output: "*",
    },
    {
      input: ["~10.12", "^13"],
      output: "~10.12.0||^13.0.0",
    },
    {
      input: ["10.12 - 12", "^13"],
      output: ">=10.12.0 <13.0.0-0||^13.0.0",
    },
    {
      input: ["~1.2.3-beta.2"],
      output: "~1.2.3-beta.2",
    },
    {
      input: ["^1.2.3-beta.2"],
      output: "^1.2.3-beta.2",
    },
    {
      input: [""],
      output: "*",
    },
    {
      input: ["*"],
      output: "*",
    },
    {
      input: ["0.13.0"],
      output: "0.13.0",
    },
    {
      input: ["0.13.0", "=0.13.0"],
      output: "0.13.0",
    },
    {
      input: ["=0.13.0", "0.13.0"],
      output: "0.13.0",
    },
    {
      input: ["^0.1.0"],
      output: "~0.1.0",
    },
    {
      input: [">=0.1.0 <1.0.0-0"],
      output: ">=0.1.0 <1.0.0-0",
    },
    {
      input: ["~0.1.0"],
      output: "~0.1.0",
    },
  ];
  for (const { input, output } of testcases) {
    it(`Normalizing [${input
      .map((s) => `"${s}"`)
      .join(", ")}] should result in "${output}".`, () => {
      const inRanges = input.map((i) => new Range(i));
      const outRange = normalizeSemverRange(...inRanges)!;
      assert.strictEqual(outRange.raw, output);

      for (const inRange of inRanges) {
        assert.ok(
          subset(inRange, outRange),
          `"${inRange}" is a subset of "${outRange}".`,
        );
      }
    });
  }
});
describe("maxNextVersion", () => {
  const testcases = [
    {
      input: ">=10",
      output: null,
    },
    {
      input: "^10",
      output: "11.0.0-0",
    },
    {
      input: "*",
      output: null,
    },
  ];
  for (const { input, output } of testcases) {
    it(`Get max next version "${input}" should result in "${output}".`, () => {
      const inRange = new Range(input);
      const outRange = maxNextVersion(inRange);
      assert.strictEqual(outRange?.raw ?? null, output);
    });
  }
});
