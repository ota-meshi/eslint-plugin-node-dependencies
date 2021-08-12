import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import {
    compositingVisitors,
    defineJsonVisitor,
    getEngines,
    createRule,
    iterateMeta,
    getDependencies,
    getSemverRange,
    stripExtraSpaces,
    getMeta,
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
         * Remove valid modules
         */
        function removeValidModule(
            targetEngines: Map<
                string,
                { adjust: semver.Range; original: semver.Range }
            >,
            depEngines: Map<string, string>,
            invalidEngines: Map<string, string>,
        ) {
            for (const [module, ver] of targetEngines) {
                const depVer = getSemverRange(depEngines.get(module))

                if (!depVer || semver.subset(ver.adjust, depVer)) {
                    targetEngines.delete(module)
                } else {
                    invalidEngines.set(module, depVer.raw)
                }
            }
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
            const targetEngines = new Map(engines)
            const invalidEngines = new Map<string, string>()

            let allEmpty = true
            for (const meta of iterateMeta(name, ver, context)) {
                const depEngines = getEngines(meta)
                if (depEngines.size) {
                    allEmpty = false
                }
                removeValidModule(targetEngines, depEngines, invalidEngines)
                if (targetEngines.size === 0) {
                    break
                }
            }
            const meta = getMeta(name, ver, context)
            const depEngines = getEngines(meta)
            for (const [module, moduleVer] of targetEngines) {
                const depVer = invalidEngines.get(module)!
                context.report({
                    loc: node.loc,
                    message: `${currModules
                        .map((m) => `"${m}"`)
                        .join(
                            " >> ",
                        )} is not compatible with "${module}@${stripExtraSpaces(
                        moduleVer.original.raw,
                    )}". Allowed is: "${module}@${stripExtraSpaces(depVer)}"`,
                })
            }
            if (
                engines.size === depEngines.size &&
                [...engines.keys()].every((m) => depEngines.has(m))
            ) {
                return
            }
            if (deep && allEmpty) {
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
