import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import {
    getEngines,
    createRule,
    getMeta,
    getDependencies,
    getSemverRange,
} from "../utils"
import semver from "semver"
import { getKey, getKeyFromJSONProperty } from "../utils/ast-utils"

export default createRule("valid-engines", {
    meta: {
        docs: {
            description:
                "enforce the versions of the engines of the dependencies to be compatible.",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [
            {
                type: "object",
                properties: {
                    deep: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {},
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }
        const deep = context.options[0]?.deep !== false

        type ObjectStack = {
            node: AST.JSONObjectExpression | AST.JSONArrayExpression
            upper: ObjectStack | null
            key: string | number | null
        }
        let stack: ObjectStack | null = null
        const engines: Map<string, semver.Range> = new Map()

        /**
         * Verify
         */
        function verify(
            depEngines: Map<string, string>,
            node: AST.JSONProperty,
            modules: string[],
        ) {
            let valid = true
            for (const [module, ver] of engines) {
                const depVer = getSemverRange(depEngines.get(module))
                if (depVer && !semver.subset(ver, depVer)) {
                    context.report({
                        loc: node.loc,
                        message: `${modules
                            .map((m) => `"${m}"`)
                            .join(
                                ">",
                            )} is not compatible with "${module}@${ver}". Allowed is: "${module}@${depVer}"`,
                    })
                    valid = false
                }
            }
            return valid
        }

        /**
         * Process module
         */
        function processModule(
            name: string,
            ver: string,
            modules: string[],
            node: AST.JSONProperty,
        ) {
            const currModules = [...modules, `${name}@${ver}`]
            const meta = getMeta(name, ver, context)
            const depEngines = getEngines(meta)

            if (!verify(depEngines, node, currModules)) {
                return
            }
            if (
                engines.size === depEngines.size &&
                [...engines.keys()].every((m) => depEngines.has(m))
            ) {
                return
            }

            if (deep) {
                const dependencies = getDependencies(meta, "dependencies")
                const peerDependencies = getDependencies(
                    meta,
                    "peerDependencies",
                )
                for (const [n, v] of dependencies) {
                    processModule(n, v, currModules, node)
                }
                for (const [n, v] of peerDependencies) {
                    processModule(n, v, currModules, node)
                }
            }
        }

        return {
            Program(node: AST.JSONProgram) {
                for (const [key, val] of getEngines(getStaticJSONValue(node))) {
                    const v = getSemverRange(val)
                    if (v) {
                        engines.set(key, v)
                    }
                }
            },
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
                    engines.size === 0 ||
                    !stack ||
                    (stack.key !== "dependencies" &&
                        stack.key !== "peerDependencies") ||
                    !stack.upper ||
                    stack.upper.key != null // root
                ) {
                    return
                }
                const name = getKeyFromJSONProperty(node)
                const ver = getStaticJSONValue(node.value)
                if (typeof name !== "string" || typeof ver !== "string") {
                    return
                }
                processModule(name, ver, [], node)
            },
        }
    },
})
