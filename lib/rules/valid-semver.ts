import { getStaticJSONValue } from "jsonc-eslint-parser"
import { createRule, defineJsonVisitor } from "../utils"
import { getKeyFromJSONProperty } from "../utils/ast-utils"
import { getSemverRange } from "../utils/semver"

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
                if (typeof ver !== "string" || ver == null) {
                    context.report({
                        loc: node.value.loc,
                        message: `\`${JSON.stringify(ver)}\` is invalid.`,
                    })
                    return
                }
                if (getSemverRange(ver) == null) {
                    context.report({
                        loc: node.value.loc,
                        message: `"${ver}" is invalid.`,
                    })
                }
            },
            "dependencies, peerDependencies, devDependencies, optionalDependencies"(
                node,
            ) {
                const name = getKeyFromJSONProperty(node)
                if (typeof name !== "string") {
                    return
                }
                const ver = getStaticJSONValue(node.value)
                if (typeof ver !== "string" || ver == null) {
                    context.report({
                        loc: node.value.loc,
                        message: `\`${JSON.stringify(ver)}\` is invalid.`,
                    })
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
