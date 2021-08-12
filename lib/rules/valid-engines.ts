import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import {
    compositingVisitors,
    defineJsonVisitor,
    getEngines,
    createRule,
    getMeta,
    getDependencies,
    getSemverRange,
    stripExtraSpaces,
} from "../utils"
import semver from "semver"
import { getKeyFromJSONProperty } from "../utils/ast-utils"

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
        const engines: Map<
            string,
            { adjust: semver.Range; original: semver.Range }
        > = new Map()

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

                if (depVer && !semver.subset(ver.adjust, depVer)) {
                    context.report({
                        loc: node.loc,
                        message: `${modules
                            .map((m) => `"${m}"`)
                            .join(
                                " >> ",
                            )} is not compatible with "${module}@${stripExtraSpaces(
                            ver.original.raw,
                        )}". Allowed is: "${module}@${stripExtraSpaces(
                            depVer.raw,
                        )}"`,
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

        return compositingVisitors(
            {
                Program(node: AST.JSONProgram) {
                    for (const [key, val] of getEngines(
                        getStaticJSONValue(node),
                    )) {
                        const v = getSemverRange(val)
                        if (!v) {
                            continue
                        }

                        // Adjust "node@>=16" and "node@^16" to be considered compatible.
                        const adjustVars: string[] = []
                        for (const cc of v.set) {
                            if (cc.length === 1) {
                                if (
                                    cc[0].operator === ">" ||
                                    cc[0].operator === ">="
                                ) {
                                    adjustVars.push(
                                        `${cc[0].value} <${semver.inc(
                                            cc[0].semver.version,
                                            "premajor",
                                        )}`,
                                    )
                                    continue
                                }
                            }
                            adjustVars.push(cc.map((c) => c.value).join(" "))
                        }
                        engines.set(key, {
                            adjust: new semver.Range(adjustVars.join("||")),
                            original: v,
                        })
                    }
                },
            },
            defineJsonVisitor({
                "dependencies, peerDependencies"(node) {
                    if (engines.size === 0) {
                        return
                    }
                    const name = getKeyFromJSONProperty(node)
                    const ver = getStaticJSONValue(node.value)
                    if (typeof name !== "string" || typeof ver !== "string") {
                        return
                    }
                    processModule(name, ver, [], node)
                },
            }),
        )
    },
})
