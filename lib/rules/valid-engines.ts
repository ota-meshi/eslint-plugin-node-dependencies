import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import type { PackageMeta } from "../utils"
import {
    normalizeSemverRange,
    getMetaFromNpm,
    compositingVisitors,
    defineJsonVisitor,
    getEngines,
    createRule,
    getDependencies,
    getSemverRange,
    normalizeVer,
    getMetaFromNodeModules,
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

        class EnginesContext {
            public readonly engines: ReadonlySet<string>

            private readonly unprocessedEngines = new Set<string>()

            private readonly invalidEngines = new Map<
                string,
                Map<string, semver.Range>
            >()

            private readonly validEngines = new Set<string>()

            public constructor(engineNames: Iterable<string>) {
                this.engines = new Set(engineNames)
                this.unprocessedEngines = new Set(this.engines)
            }

            public nextContext(): EnginesContext {
                const engineNames = new Set(this.engines)
                for (const nm of this.validEngines) {
                    engineNames.delete(nm)
                }
                for (const nm of this.invalidEngines.keys()) {
                    engineNames.delete(nm)
                }
                return new EnginesContext(engineNames)
            }

            public markAsProcessed(module: string) {
                this.unprocessedEngines.delete(module)
            }

            public isAllProcessed(): boolean {
                return this.unprocessedEngines.size === 0
            }

            public markAsValid(module: string) {
                this.validEngines.add(module)
                this.invalidEngines.delete(module)
            }

            public addInvalid(module: string, allowedVer: semver.Range) {
                if (this.validEngines.has(module)) {
                    return
                }
                const vers = this.invalidEngines.get(module)
                if (vers) {
                    vers.set(allowedVer.raw, allowedVer)
                } else {
                    this.invalidEngines.set(
                        module,
                        new Map([[allowedVer.raw, allowedVer]]),
                    )
                }
            }

            public clearInvalid() {
                this.invalidEngines.clear()
            }

            public hasInvalid() {
                return this.invalidEngines.size > 0
            }

            public getInvalid(): ReadonlyMap<
                string,
                Map<string, semver.Range>
            > {
                return this.invalidEngines
            }
        }

        /**
         * Process meta data
         */
        function processMeta(ctx: EnginesContext, meta: PackageMeta | null) {
            const depEngines = getEngines(meta)
            for (const module of ctx.engines) {
                const ver = engines.get(module)!
                const e = depEngines.get(module)
                if (e) {
                    ctx.markAsProcessed(module)
                    const depVer = getSemverRange(e)

                    if (depVer) {
                        if (semver.subset(ver.adjust, depVer)) {
                            ctx.markAsValid(module)
                        } else {
                            ctx.addInvalid(module, depVer)
                        }
                    }
                }
            }
        }

        /**
         * Process module
         */
        function processModule(
            ctx: EnginesContext,
            name: string,
            ver: string,
            modules: string[],
            node: AST.JSONProperty,
        ) {
            const currModules = [...modules, `${name}@${ver}`]

            processMeta(ctx, getMetaFromNodeModules(name, ver, context))

            if (!ctx.hasInvalid() && ctx.isAllProcessed()) {
                return
            }
            const metaList = getMetaFromNpm(name, ver)
            if (!metaList) {
                return
            }
            for (const meta of metaList) {
                processMeta(ctx, meta)
                if (!ctx.hasInvalid() && ctx.isAllProcessed()) {
                    return
                }
            }
            for (const [module, allowedVers] of ctx.getInvalid()) {
                const moduleVer = engines.get(module)!
                const depVer =
                    normalizeSemverRange(...allowedVers.values()) ||
                    [...allowedVers.values()].pop()!
                if (semver.subset(moduleVer.adjust, depVer)) {
                    continue
                }
                context.report({
                    loc: node.loc,
                    message: `${currModules
                        .map((m) => `"${m}"`)
                        .join(
                            " >> ",
                        )} is not compatible with "${module}@${normalizeVer(
                        moduleVer.original,
                    )}". Allowed is: "${module}@${normalizeVer(depVer)}"`,
                })
            }
            if (ctx.isAllProcessed()) {
                return
            }
            if (deep) {
                for (const [n, ranges] of extractDependencies(metaList)) {
                    const v = normalizeSemverRange(...ranges)
                    if (v)
                        processModule(
                            ctx.nextContext(),
                            n,
                            v.raw,
                            currModules,
                            node,
                        )
                }
            }
        }

        /** Extract dependencies */
        function extractDependencies(metaList: PackageMeta[]) {
            const dependencies = new Map<string, semver.Range[]>()
            for (const meta of metaList) {
                for (const [m, v] of [
                    ...getDependencies(meta, "dependencies"),
                    ...getDependencies(meta, "peerDependencies"),
                ]) {
                    const range = getSemverRange(v)
                    if (!range) {
                        continue
                    }
                    const ranges = dependencies.get(m)
                    if (ranges) {
                        ranges.push(range)
                    } else {
                        dependencies.set(m, [range])
                    }
                }
            }

            return dependencies
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
                    const ctx = new EnginesContext(engines.keys())
                    processModule(ctx, name, ver, [], node)
                },
            }),
        )
    },
})
