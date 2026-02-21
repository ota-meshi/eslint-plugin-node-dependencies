import type {
  JSONExpression,
  JSONStringLiteral,
} from "jsonc-eslint-parser/lib/parser/ast";
import { SemVer } from "semver";
import { createRule, defineJsonVisitor } from "../utils/index.ts";
import { getSemverRange } from "../utils/semver.ts";
import type { RangeResult } from "../utils/semver-range.ts";
import { iterateSemverRanges } from "../utils/semver-range.ts";

export default createRule("prefer-caret-range-version", {
  meta: {
    docs: {
      description: "require caret(`^`) version instead of range version.",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {},
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }

    /**
     * Convert to use caret range syntax.
     */
    function convertToUseCaret(range: RangeResult) {
      if (range.comparators.length !== 2) {
        return null;
      }
      const start = range.comparators.find((c) => c.operator === ">=");
      const end = range.comparators.find((c) => c.operator === "<");
      if (!start || !end) {
        return null;
      }
      const caretRangeText = `^${start.semver.version}`;
      const caretRange = getSemverRange(caretRangeText);
      if (!caretRange) {
        return null;
      }
      const caretEnd = caretRange.set[0].find((c) => c.operator === "<");
      if (!caretEnd) {
        // invalid?
        return null;
      }

      if (caretEnd.semver.compare(end.semver) !== 0) {
        const endPre = new SemVer(`${end.semver.version}-0`);
        if (caretEnd.semver.compare(endPre) !== 0) {
          return null;
        }
      }
      return caretRangeText;
    }

    /**
     * Verify for range
     */
    function verifyRange(range: RangeResult, node: JSONStringLiteral) {
      const fixedRange = convertToUseCaret(range);
      if (!fixedRange) {
        return;
      }
      context.report({
        loc: {
          start: sourceCode.getLocFromIndex(node.range[0] + range.range[0]),
          end: sourceCode.getLocFromIndex(node.range[0] + range.range[1]),
        },
        message: `Use '${fixedRange}' syntax instead.`,
        fix(fixer) {
          return fixer.replaceTextRange(
            node.range,
            JSON.stringify(
              node.value.slice(0, range.range[0]) +
                fixedRange +
                node.value.slice(range.range[1]),
            ),
          );
        },
      });
    }

    /**
     * Verify for version
     */
    function verifyVersion(node: JSONStringLiteral) {
      if (maybeDepId(node.value)) {
        return;
      }

      for (const range of iterateSemverRanges(node.value)) {
        const lowerRange = range.value.toLowerCase();
        if (!lowerRange.startsWith("~")) {
          if (
            // Already caret range
            lowerRange.startsWith("^") ||
            // Ignore major number
            /^\d+$/u.test(range.value) ||
            // Ignore `.x` range (not hyphen range)
            ((range.value.endsWith(".x") || range.value.endsWith(".*")) &&
              !/\s+-\s+/u.test(range.value))
          )
            continue;
        }
        verifyRange(range, node);
      }
    }

    return defineJsonVisitor({
      "engines, dependencies, peerDependencies, devDependencies, optionalDependencies"(
        node,
      ) {
        if (isJSONStringLiteral(node.value)) {
          verifyVersion(node.value);
        }
      },
    });
  },
});

/**
 * Checks whether the given expression is string literal or not
 */
function isJSONStringLiteral(node: JSONExpression): node is JSONStringLiteral {
  return node.type === "JSONLiteral" && typeof node.value === "string";
}

/** Checks whether the given ver is dependencies identify */
function maybeDepId(ver: string): boolean {
  return ver.includes("/") || ver.includes(":") || /^[-a-z]+$/.test(ver);
}
