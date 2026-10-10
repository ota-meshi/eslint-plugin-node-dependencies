import assert from "node:assert";
import { SemVer } from "semver";
import { Range } from "../../../../lib/utils/semver/range.ts";

describe("Range", () => {
  describe("constructor", () => {
    it("preserves the raw range and separate comparator sets", () => {
      const range = new Range("  ^1  ||  ^3  ");
      assert.strictEqual(range.raw, "^1 || ^3");
      assert.strictEqual(range.toString(), range.raw);
      const comparatorValues = [];
      for (const comparators of range.set) {
        comparatorValues.push(comparators.map((c) => c.value));
      }
      assert.deepStrictEqual(comparatorValues, [
        [">=1.0.0", "<2.0.0-0"],
        [">=3.0.0", "<4.0.0-0"],
      ]);
    });

    it("treats an empty range as a wildcard", () => {
      const range = new Range("");
      assert.ok(range.test("1.2.3"));
      assert.strictEqual(range.test("1.2.3-preview.0"), false);
    });

    for (const input of ["* || invalid", "invalid || *"]) {
      it(`rejects an invalid OR clause in "${input}"`, () => {
        assert.throws(() => new Range(input), TypeError);
      });
    }
  });

  describe("test", () => {
    for (const prerelease of ["56.0.0-preview.0", "0.0.0-preview.0"]) {
      for (const input of [`*||${prerelease}`, `${prerelease}||*`]) {
        it(`preserves wildcard and explicit prerelease membership in "${input}"`, () => {
          const range = new Range(input);
          assert.strictEqual(range.set.length, 2);
          assert.ok(range.test("0.0.0"));
          assert.ok(range.test("56.0.0"));
          assert.ok(range.test(prerelease));
          assert.ok(range.test(new SemVer(prerelease)));
          assert.strictEqual(
            range.test(prerelease.replace(/\.0$/u, ".1")),
            false,
          );
          assert.strictEqual(range.test("55.0.0-preview.0"), false);
          assert.strictEqual(range.test("0.0.0-0"), false);
          assert.ok(new Range(range.toString()).test(prerelease));
        });
      }
    }

    for (const input of [" || 0.0.0-preview.0", "0.0.0-preview.0 || "]) {
      it(`preserves an empty OR clause as a wildcard in "${input}"`, () => {
        const range = new Range(input);
        assert.ok(range.test("1.2.3"));
        assert.ok(range.test("0.0.0-preview.0"));
        assert.strictEqual(range.test("0.0.0-preview.1"), false);
      });
    }
  });

  describe("isSubsetOf", () => {
    it("checks each input OR branch against the matching output branch", () => {
      const versions = new Range("1.2.3 || 3.4.5");
      const ranges = new Range("^1 || ^3");
      assert.ok(versions.isSubsetOf(ranges));
      assert.strictEqual(ranges.isSubsetOf(versions), false);
      assert.strictEqual(new Range("1.2.3 || 2.3.4").isSubsetOf(ranges), false);
    });

    it("includes an explicit prerelease branch beyond the wildcard", () => {
      const range = new Range("* || 0.0.0-preview.0");
      assert.ok(new Range("*").isSubsetOf(range));
      assert.ok(new Range("0.0.0-preview.0").isSubsetOf(range));
      assert.strictEqual(range.isSubsetOf(new Range("*")), false);
      assert.strictEqual(new Range("0.0.0-preview.1").isSubsetOf(range), false);
    });
  });

  describe("intersects", () => {
    const testcases = [
      { left: "^1", right: "~1.2", expected: true },
      { left: "^1", right: "^2", expected: false },
      { left: "^1 || ^3", right: "^2 || ~3.4", expected: true },
      { left: "^1 || ^3", right: "^2 || ^4", expected: false },
    ];
    for (const { left, right, expected } of testcases) {
      it(`checks intersections between "${left}" and "${right}"`, () => {
        const leftRange = new Range(left);
        const rightRange = new Range(right);
        assert.strictEqual(leftRange.intersects(rightRange), expected);
        assert.strictEqual(rightRange.intersects(leftRange), expected);
      });
    }
  });
});
