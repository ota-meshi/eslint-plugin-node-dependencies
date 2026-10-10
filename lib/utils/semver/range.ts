import { Range as SemverRange, subset, intersects } from "semver";
import type { SemVer } from "semver";

/**
 * A wrapper around semver's Range that preserves the union of OR branches.
 *
 * In semver 7.8.5, the Range constructor discards the other OR branches when
 * one branch is a wildcard. For example, "* || 56.0.0-preview.0" becomes "*"
 * internally. Since "*" excludes prereleases by default, this removes the
 * explicitly allowed "56.0.0-preview.0" and changes which versions match.
 *
 * The compat-engines rule combines requirements from multiple dependency
 * versions. For example, expo-sqlite versions declare expo peer requirements
 * of "*" or "56.0.0-preview.0". Their combined range must retain the versions
 * allowed by either requirement, including that explicit prerelease.
 *
 * Each OR branch is therefore kept as a separate, unmodified semver Range.
 * Parsing, version matching, and single-branch subset/intersection checks
 * remain delegated to semver. This wrapper composes those branch results and
 * exposes their comparator sets to the existing normalization logic.
 *
 * Combined ranges must also be reparsed through this wrapper when passed as
 * strings to dependency metadata lookups. Passing the combined text directly
 * to semver's Range constructor would discard the prerelease branch again.
 *
 * @see https://github.com/ota-meshi/eslint-plugin-node-dependencies/issues/300
 * @see https://github.com/npm/node-semver#ranges
 */
export class Range {
  public readonly raw: string;

  public readonly set: SemverRange["set"];

  private readonly ranges: readonly SemverRange[];

  public constructor(value: string) {
    this.raw = value.trim().replace(/\s+/g, " ");
    this.ranges = this.raw.split("||").map((part) => new SemverRange(part));
    this.set = this.ranges.flatMap((range) => range.set);
  }

  /** Check whether a version matches any branch. */
  public test(version: string | SemVer): boolean {
    return this.ranges.some((range) => range.test(version));
  }

  /** Check whether each branch is contained in a branch of the given range. */
  public isSubsetOf(other: Range): boolean {
    return this.ranges.every((range) =>
      other.ranges.some((otherRange) => subset(range, otherRange)),
    );
  }

  /** Check whether any branches of the two ranges intersect. */
  public intersects(other: Range): boolean {
    return this.ranges.some((range) =>
      other.ranges.some((otherRange) => intersects(range, otherRange)),
    );
  }

  /** Get the range text. */
  public toString(): string {
    return this.raw;
  }
}
