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
        schema: [],
        messages: {},
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }

        return defineJsonVisitor({
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
