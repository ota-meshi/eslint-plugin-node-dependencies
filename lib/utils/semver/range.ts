import { parseRange, satisfies, isRangeSubset, rangesIntersect } from "verkit";
import type { SemVer, SemVerRange } from "verkit";

/**
 * A wrapper around verkit's parsed ranges that preserves the union of OR branches.
 *
 * semver 7.8.5's Range constructor simplifies OR ranges containing a wildcard
 * to the wildcard alone. verkit 0.5.0 inherits this behavior in parseRange.
 * This is correct for "* || 56.0.0", since "*" already includes stable versions.
 * However, "*" excludes prereleases by default, so simplifying
 * "* || 56.0.0-preview.0" to "*" incorrectly removes the explicitly allowed
 * "56.0.0-preview.0" and changes which versions match. verkit inherits this
 * semver bug, so replacing semver does not remove the need for this wrapper.
 *
 * The compat-engines rule combines requirements from multiple dependency
 * versions. For example, expo-sqlite versions declare expo peer requirements
 * of "*" or "56.0.0-preview.0". Their combined range must retain the versions
 * allowed by either requirement, including that explicit prerelease.
 *
 * When a wildcard branch exists, verkit's subset check removes branches it
 * identifies as already covered by the wildcard. Other branches remain as
 * separate, unmodified parsed ranges, preserving explicitly allowed prereleases.
 * Parsing, version matching, and single-branch subset/intersection checks
 * remain delegated to verkit. This wrapper composes those branch results and
 * exposes their comparator sets to the existing normalization logic.
 *
 * Combined ranges must also be reparsed through this wrapper when passed as
 * strings to dependency metadata lookups. Passing the combined text directly
 * to verkit's parseRange would discard the prerelease branch again.
 *
 * @see https://github.com/ota-meshi/eslint-plugin-node-dependencies/issues/300
 * @see https://github.com/sxzz/verkit/blob/v0.5.0/src/range/parse.ts#L319-L325
 */
export class Range {
  public readonly raw: string;

  public readonly set: SemVerRange["sets"];

  private readonly ranges: readonly SemVerRange[];

  public constructor(value: string) {
    this.raw = value.trim().replace(/\s+/g, " ");
    const ranges = this.raw.split("||").map((part) => parseRange(part));
    const wildcard = ranges.find(
      (range) =>
        range.sets.length === 1 &&
        range.sets[0].length === 1 &&
        range.sets[0][0].version === null,
    );
    this.ranges = wildcard
      ? ranges.filter(
          (range) => range === wildcard || !isRangeSubset(range, wildcard),
        )
      : ranges;
    this.set = this.ranges.flatMap((range) => range.sets);
  }

  /** Check whether a version matches any branch. */
  public test(version: string | SemVer): boolean {
    return this.ranges.some((range) => satisfies(version, range));
  }

  /** Check whether each branch is contained in a branch of the given range. */
  public isSubsetOf(other: Range): boolean {
    return this.ranges.every((range) =>
      other.ranges.some((otherRange) => isRangeSubset(range, otherRange)),
    );
  }

  /** Check whether any branches of the two ranges intersect. */
  public intersects(other: Range): boolean {
    return this.ranges.some((range) =>
      other.ranges.some((otherRange) => rangesIntersect(range, otherRange)),
    );
  }

  /** Get the range text. */
  public toString(): string {
    return this.raw;
  }
}
