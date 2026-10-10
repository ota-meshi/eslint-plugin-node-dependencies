import type { SemVerComparator, SemVer } from "verkit";
import {
  compare,
  isLessThan,
  increment,
  normalize,
  parse,
  tryParse,
} from "verkit";
import { Range } from "./semver/range.ts";

export { Range };

type RangeComparator =
  | { min: SemVerComparator; max: SemVerComparator }
  | { min: null; max: SemVerComparator }
  | { min: SemVerComparator; max: null };

/** Get the semver range instance from given value */
export function getSemverRange(value: string | undefined | null): Range | null {
  if (value == null) {
    return null;
  }
  try {
    return new Range(value);
  } catch {
    return null;
  }
}

/** Normalize version */
export function normalizeVer(ver: Range): string {
  const n = normalizeSemverRange(ver);
  if (n) {
    return n.raw;
  }
  return ver.raw;
}

/** Normalize semver ranges. */
export function normalizeSemverRange(...values: Range[]): Range | null {
  const map = new Map<
    string,
    { range: Range; comparators: readonly SemVerComparator[] }
  >();
  for (const ver of values) {
    for (const comparators of ver.set) {
      const normalized = normalizeComparators(comparators);
      if (map.has(normalized)) {
        continue;
      }
      const normalizedVer = getSemverRange(normalized);
      if (!normalizedVer) {
        continue;
      }
      let consume = false;
      let target: { range: Range; comparators: readonly SemVerComparator[] } = {
        range: normalizedVer,
        comparators,
      };
      for (const [k, data] of map) {
        if (target.range.isSubsetOf(data.range)) {
          consume = true;
          break;
        }
        if (data.range.isSubsetOf(target.range)) {
          map.delete(k);
        }
        if (target.range.intersects(data.range)) {
          const newComparators = joinComparators(comparators, data.comparators);
          if (newComparators) {
            target = {
              range: new Range(normalizeComparators(newComparators)),
              comparators: newComparators,
            };
            map.delete(k);
          }
        }
      }
      if (consume) {
        continue;
      }
      map.set(target.range.raw, target);
    }
  }
  const ranges = [...map]
    .sort(([, a], [, b]) => {
      const aVer = getMinVer(a.comparators);
      const bVer = getMinVer(b.comparators);

      return compare(aVer, bVer);
    })
    .map(([v]) => v);
  return getSemverRange(ranges.join("||"));

  /** Get min version */
  function getMinVer(comparators: readonly SemVerComparator[]) {
    let min: SemVer | null = null;
    for (const comp of comparators) {
      if (comp.version === null) {
        return parse("0.0.0-0");
      }
      if (!min || compare(comp.version, min) < 0) {
        min = comp.version;
      }
    }
    return min!;
  }
}

/** Normalize comparators */
function normalizeComparators(
  comparators: readonly SemVerComparator[],
): string {
  const rangeComparator = toRangeComparator(comparators);
  if (rangeComparator && rangeComparator.min && rangeComparator.max) {
    const minVersion = rangeComparator.min.version!;
    const maxVersion = normalize(rangeComparator.max.version!);
    if (
      rangeComparator.min.operator === ">=" &&
      rangeComparator.max.operator === "<"
    ) {
      if (
        minVersion.major !== 0 &&
        increment(minVersion, "premajor") === maxVersion
      )
        return `^${normalize(minVersion)}`;
      if (increment(minVersion, "preminor") === maxVersion)
        return `~${normalize(minVersion)}`;
    }
  }
  return comparators.map(normalizeComparator).join(" ");
}

/** Normalize comparator */
function normalizeComparator(comparator: SemVerComparator): string {
  if (comparator.operator === "") {
    return comparator.value || "*";
  }
  return comparator.value;
}

/** Join */
function joinComparators(
  a: readonly SemVerComparator[],
  b: readonly SemVerComparator[],
): readonly SemVerComparator[] | null {
  const aRangeComparator = toRangeComparator(a);
  const bRangeComparator = toRangeComparator(b);
  if (aRangeComparator && bRangeComparator) {
    const comparators: SemVerComparator[] = [];
    if (aRangeComparator.min && bRangeComparator.min) {
      comparators.push(
        compare(aRangeComparator.min.version!, bRangeComparator.min.version!) <=
          0
          ? aRangeComparator.min
          : bRangeComparator.min,
      );
    }
    if (aRangeComparator.max && bRangeComparator.max) {
      comparators.push(
        compare(aRangeComparator.max.version!, bRangeComparator.max.version!) >=
          0
          ? aRangeComparator.max
          : bRangeComparator.max,
      );
    }
    if (comparators.length === 0) {
      return new Range("*").set[0];
    }
    return comparators;
  }

  return null;
}

/** Convert to RangeComparator */
function toRangeComparator(
  comparators: readonly SemVerComparator[],
): RangeComparator | null {
  if (comparators.length === 2) {
    if (comparators[0].operator === ">" || comparators[0].operator === ">=") {
      if (comparators[1].operator === "<" || comparators[1].operator === "<=") {
        return {
          min: comparators[0],
          max: comparators[1],
        };
      }
    } else if (
      comparators[0].operator === "<" ||
      comparators[0].operator === "<="
    ) {
      if (comparators[1].operator === ">" || comparators[1].operator === ">=") {
        return {
          min: comparators[1],
          max: comparators[0],
        };
      }
    }
  }
  if (comparators.length === 1) {
    if (comparators[0].operator === ">" || comparators[0].operator === ">=") {
      return {
        min: comparators[0],
        max: null,
      };
    } else if (
      comparators[0].operator === "<" ||
      comparators[0].operator === "<="
    ) {
      return {
        min: null,
        max: comparators[0],
      };
    }
  }
  return null;
}

/** Get max version */
export function maxNextVersion(range: Range): SemVer | null {
  let maxVer: SemVer | null = null;
  for (const comparators of range.set) {
    let max = null;
    let hasMin = false;
    for (const comparator of comparators) {
      const compVer =
        comparator.operator === "<="
          ? tryParse(increment(comparator.version!, "prerelease")!)
          : comparator.version;
      if (compVer === null) {
        return null;
      }
      if (
        comparator.operator === "<=" ||
        comparator.operator === "<" ||
        comparator.operator === ""
      ) {
        if (!max || isLessThan(max, compVer)) {
          max = compVer;
        }
      } else if (comparator.operator === ">=" || comparator.operator === ">") {
        hasMin = true;
      }
    }
    if (max) {
      if (!maxVer || isLessThan(maxVer, max)) {
        maxVer = max;
      }
    } else {
      if (hasMin) {
        return null;
      }
    }
  }

  return maxVer;
}

/** Checks whether the given comparator is ANY comparator or not. */
export function isAnyComparator(comparator: SemVerComparator): boolean {
  return comparator.version === null;
}
