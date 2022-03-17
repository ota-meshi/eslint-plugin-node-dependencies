import type {
    JSONExpression,
    JSONStringLiteral,
} from "jsonc-eslint-parser/lib/parser/ast"
import { SemVer } from "semver"
import { createRule, defineJsonVisitor } from "../utils"
import { getSemverRange } from "../utils/semver"
import type { RangeResult } from "../utils/semver-range"
import { iterateSemverRanges } from "../utils/semver-range"

export default createRule("prefer-tilde-range-version", {
    meta: {
        docs: {
            description: "require tilde(`~`) version instead of range version.",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [],
        messages: {},
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }

        const sourceCode = context.getSourceCode()

        /**
         * Convert to use tilde range syntax.
         */
        function convertToUseTilde(range: RangeResult) {
            if (range.comparators.length !== 2) {
                return null
            }
            const start = range.comparators.find((c) => c.operator === ">=")
            const end = range.comparators.find((c) => c.operator === "<")
            if (!start || !end) {
                return null
            }
            const tildeRangeText = `~${start.semver.version}`
            const tildeRange = getSemverRange(tildeRangeText)
            if (!tildeRange) {
                return null
            }
            const tildeEnd = tildeRange.set[0].find((c) => c.operator === "<")
            if (!tildeEnd) {
                // invalid?
                return null
            }

            if (tildeEnd.semver.compare(end.semver) !== 0) {
                const endPre = new SemVer(`${end.semver.version}-0`)
                if (tildeEnd.semver.compare(endPre) !== 0) {
                    return null
                }
            }
            return tildeRangeText
        }

        /**
         * Verify for range
         */
        function verifyRange(range: RangeResult, node: JSONStringLiteral) {
            const fixedRange = convertToUseTilde(range)
            if (!fixedRange) {
                return
            }
            context.report({
                loc: {
                    start: sourceCode.getLocFromIndex(
                        node.range[0] + range.range[0],
                    ),
                    end: sourceCode.getLocFromIndex(
                        node.range[0] + range.range[1],
                    ),
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
                    )
                },
            })
        }

        /**
         * Verify for version
         */
        function verifyVersion(node: JSONStringLiteral) {
            if (maybeDepId(node.value)) {
                return
            }

            for (const range of iterateSemverRanges(node.value)) {
                const lowerRange = range.value.toLowerCase()
                if (!lowerRange.startsWith("^")) {
                    if (
                        // Already tilde range
                        lowerRange.startsWith("~") ||
                        // Ignore major number
                        /^\d+$/u.test(range.value) ||
                        // Ignore minor number
                        /^\d+\.\d+$/u.test(range.value) ||
                        // Ignore `.x` range (not hyphen range)
                        ((range.value.endsWith(".x") ||
                            range.value.endsWith(".*")) &&
                            !/\s+-\s+/u.test(range.value))
                    )
                        continue
                }
                verifyRange(range, node)
            }
        }

        return defineJsonVisitor({
            "engines, dependencies, peerDependencies, devDependencies, optionalDependencies"(
                node,
            ) {
                if (isJSONStringLiteral(node.value)) {
                    verifyVersion(node.value)
                }
            },
        })
    },
})

/**
 * Checks whether the given expression is string literal or not
 */
function isJSONStringLiteral(node: JSONExpression): node is JSONStringLiteral {
    return node.type === "JSONLiteral" && typeof node.value === "string"
}

/** Checks whether the given ver is dependencies identify */
function maybeDepId(ver: string): boolean {
    return ver.includes("/") || ver.includes(":") || /^[-a-z]+$/.test(ver)
}
