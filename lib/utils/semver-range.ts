import type { Comparator } from "semver";
import { getSemverRange } from "./semver.ts";

export type RangeResult = {
  value: string;
  comparators: readonly Comparator[];
  range: readonly [number, number];
};
/**
 * Iterate version ranges
 */
export function* iterateSemverRanges(
  versionRanges: string,
): Iterable<RangeResult> {
  let startOffset = 0;
  for (const strRange of versionRanges.split("||")) {
    const result = toRangeResult(strRange, startOffset);
    if (result) {
      yield result;
    }
    startOffset += strRange.length + 2; /* || */
  }
}

/**
 * Build result object
 */
function toRangeResult(
  strRange: string,
  startOffset: number,
): RangeResult | null {
  let start = 0;
  while (strRange.length > start && !strRange[start].trim()) {
    start++;
  }
  let end = strRange.length;
  while (end > start && !strRange[end - 1].trim()) {
    end--;
  }

  const value = strRange.slice(start, end);
  const range = getSemverRange(value);
  if (!range) {
    return null;
  }
  if (range.set.length !== 1) {
    return null;
  }

  return {
    value,
    comparators: range.set[0],
    range: [startOffset + start, startOffset + end],
  };
}
