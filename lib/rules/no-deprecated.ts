import { getStaticJSONValue } from "jsonc-eslint-parser"
import { createRule, defineJsonVisitor, getMetaFromNpm } from "../utils"
import { getKeyFromJSONProperty } from "../utils/ast-utils"

export default createRule("no-deprecated", {
    meta: {
        docs: {
            description: "disallow having dependencies on deprecate packages.",
            category: "Best Practices",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    devDependencies: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {},
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }
        const devDependencies = Boolean(context.options[0]?.devDependencies)

        return defineJsonVisitor({
            [devDependencies
                ? "dependencies, peerDependencies, devDependencies"
                : "dependencies, peerDependencies"](node) {
                const name = getKeyFromJSONProperty(node)
                const ver = getStaticJSONValue(node.value)
                if (
                    typeof name !== "string" ||
                    typeof ver !== "string" ||
                    !ver
                ) {
                    return
                }
                const meta = getMetaFromNpm(name, ver)
                const deprecated =
                    [...meta.cache].pop()?.deprecated ||
                    [...(meta.get() ?? [])].pop()?.deprecated
                if (deprecated) {
                    context.report({
                        loc: node.loc,
                        message: `${deprecated}`,
                    })
                }
            },
        })
    },
})
