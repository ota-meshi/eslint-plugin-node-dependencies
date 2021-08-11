import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import { createRule, getSemverRange } from "../utils"
import { getKey, getKeyFromJSONProperty } from "../utils/ast-utils"

export default createRule("valid-semver", {
    meta: {
        docs: {
            description:
                "enforce versions that is valid as a semantic version.",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {},
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }

        type ObjectStack = {
            node: AST.JSONObjectExpression | AST.JSONArrayExpression
            upper: ObjectStack | null
            key: string | number | null
        }
        let stack: ObjectStack | null = null

        return {
            "JSONObjectExpression, JSONArrayExpression"(
                node: AST.JSONObjectExpression | AST.JSONArrayExpression,
            ) {
                stack = {
                    node,
                    upper: stack,
                    key: getKey(node),
                }
            },
            "JSONObjectExpression, JSONArrayExpression:exit"() {
                stack = stack && stack.upper
            },
            JSONProperty(node: AST.JSONProperty) {
                if (
                    !stack ||
                    !stack.upper ||
                    stack.upper.key != null // root
                ) {
                    return
                }
                if (stack.key === "engines") {
                    const ver = getStaticJSONValue(node.value)
                    if (typeof ver !== "string" || !ver) {
                        return
                    }
                    if (getSemverRange(ver) == null) {
                        context.report({
                            loc: node.value.loc,
                            message: `"${ver}" is invalid.`,
                        })
                    }
                }
                if (
                    stack.key === "dependencies" ||
                    stack.key === "peerDependencies" ||
                    stack.key === "devDependencies"
                ) {
                    const name = getKeyFromJSONProperty(node)
                    const ver = getStaticJSONValue(node.value)
                    if (
                        typeof name !== "string" ||
                        typeof ver !== "string" ||
                        !ver
                    ) {
                        return
                    }
                    if (maybeDepId(ver)) {
                        return
                    }
                    if (getSemverRange(ver) == null) {
                        context.report({
                            loc: node.value.loc,
                            message: `"${ver}" is invalid.`,
                        })
                    }
                }
            },
        }
    },
})

/** Checks whether the given ver is dependencies identify */
function maybeDepId(ver: string): boolean {
    return ver.includes("/") || ver.includes(":") || /^[-a-z]+$/.test(ver)
}
