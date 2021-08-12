import { getStaticJSONValue } from "jsonc-eslint-parser"
import { createRule, defineJsonVisitor, getSemverRange } from "../utils"
import { getKeyFromJSONProperty } from "../utils/ast-utils"

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

        return defineJsonVisitor({
            engines(node) {
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
            },
            "dependencies, peerDependencies, devDependencies"(node) {
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
            },
        })
    },
})

/** Checks whether the given ver is dependencies identify */
function maybeDepId(ver: string): boolean {
    return ver.includes("/") || ver.includes(":") || /^[-a-z]+$/.test(ver)
}
