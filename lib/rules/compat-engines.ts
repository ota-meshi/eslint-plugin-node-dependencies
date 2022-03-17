import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import { compositingVisitors, defineJsonVisitor, createRule } from "../utils"
import semver from "semver"
import { getKeyFromJSONProperty } from "../utils/ast-utils"
import {
    getSemverRange,
    normalizeSemverRange,
    normalizeVer,
} from "../utils/semver"
import type { PackageMeta } from "../utils/meta"
import {
    getDependencies,
    getEngines,
    getMetaFromNodeModules,
    getMetaFromNpm,
} from "../utils/meta"

type ComparisonType = "normal" | "major"
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
        return new EnginesContext(this.unprocessedEngines)
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

    public hasInvalid() {
        return this.invalidEngines.size > 0
    }

    public getInvalid(): ReadonlyMap<string, Map<string, semver.Range>> {
        return this.invalidEngines
    }
}

/**
 * Build adjusted version range for self.
 */
function buildAdjustRangeForSelf(
    comparisonType: ComparisonType,
    original: semver.Range,
): semver.Range {
    // Adjust "node@>=16" and "node@^16" to be considered compatible.
    const adjustVers: string[] = []
    for (const cc of original.set) {
        if (cc.length === 1) {
            if (cc[0].operator === ">" || cc[0].operator === ">=") {
                adjustVers.push(
                    `${cc[0].value} <${semver.inc(
                        cc[0].semver.version,
                        "premajor",
                    )}`,
                )
                continue
            }
        }
        adjustVers.push(cc.map((c) => c.value).join(" "))
    }
    const range = new semver.Range(adjustVers.join("||"))
    if (comparisonType === "normal") {
        return range
    }
    if (comparisonType === "major") {
        return range
    }

    throw new Error(`Illegal comparisonType: ${comparisonType}`)
}

/**
 * Build adjusted version range for dependencies.
 */
function buildAdjustRangeForDeps(
    comparisonType: ComparisonType,
    original: semver.Range,
): semver.Range {
    if (comparisonType === "normal") {
        return original
    }
    if (comparisonType === "major") {
        const majorVers: string[] = []
        for (const cc of original.set) {
            majorVers.push(
                cc
                    .map((c) => {
                        if (c.operator === ">" || c.operator === ">=") {
                            return `${c.operator}${c.semver.major}`
                        }
                        return c.value
                    })
                    .join(" "),
            )
        }
        return new semver.Range(majorVers.join("||"))
    }

    throw new Error(`Illegal comparisonType: ${comparisonType}`)
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

export default createRule("compat-engines", {
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
                    comparisonType: { enum: ["normal", "major"] },
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
        const comparisonType: ComparisonType =
            context.options[0]?.comparisonType ?? "normal"

        const selfEngines: Map<
            string,
            { adjust: semver.Range; original: semver.Range }
        > = new Map()

        /**
         * Process meta data
         */
        function processMeta(ctx: EnginesContext, meta: PackageMeta | null) {
            const depEngines = getEngines(meta)
            for (const module of ctx.engines) {
                const selfVer = selfEngines.get(module)!
                const engineValue = depEngines.get(module)
                if (engineValue) {
                    ctx.markAsProcessed(module)
                    const depVer = getSemverRange(engineValue)

                    if (depVer) {
                        if (
                            semver.subset(
                                selfVer.adjust,
                                buildAdjustRangeForDeps(comparisonType, depVer),
                            )
                        ) {
                            ctx.markAsValid(module)
                        } else {
                            ctx.addInvalid(module, depVer)
                        }
                    }
                }
            }
        }

        /* eslint-disable complexity -- ignore */
        /**
         * Process dependency module
         */
        function processDependencyModule(
            /* eslint-enable complexity -- ignore */
            ctx: EnginesContext,
            name: string,
            ver: string,
            modules: string[],
            node: AST.JSONProperty,
        ) {
            const currModules = [...modules, `${name}@${ver}`]

            processMeta(ctx, getMetaFromNodeModules(name, ver, { context }))

            if (!ctx.hasInvalid() && ctx.isAllProcessed()) {
                return
            }
            const metaData = getMetaFromNpm(name, ver)
            for (const meta of metaData.cache) {
                processMeta(ctx, meta)
                if (!ctx.hasInvalid() && ctx.isAllProcessed()) {
                    return
                }
            }
            const metaList = metaData.get()
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
                const selfVer = selfEngines.get(module)!
                const depVer =
                    normalizeSemverRange(...allowedVers.values()) ||
                    [...allowedVers.values()].pop()!
                if (
                    semver.subset(
                        selfVer.adjust,
                        buildAdjustRangeForDeps(comparisonType, depVer),
                    )
                ) {
                    continue
                }
                context.report({
                    loc: node.loc,
                    message: `${currModules
                        .map((m) => `"${m}"`)
                        .join(
                            " >> ",
                        )} is not compatible with "${module}@${normalizeVer(
                        selfVer.original,
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
                        processDependencyModule(
                            ctx.nextContext(),
                            n,
                            v.raw,
                            currModules,
                            node,
                        )
                }
            }
        }

        return compositingVisitors(
            {
                JSONExpressionStatement(node: AST.JSONExpressionStatement) {
                    const expr = node.expression
                    if (expr.type !== "JSONObjectExpression") {
                        return
                    }
                    const enginesNode = expr.properties.find(
                        (p) => getKeyFromJSONProperty(p) === "engines",
                    )
                    if (!enginesNode) {
                        return
                    }
                    for (const [key, val] of getEngines({
                        engines: getStaticJSONValue(enginesNode.value),
                    })) {
                        const selfVer = getSemverRange(val)
                        if (!selfVer) {
                            continue
                        }

                        selfEngines.set(key, {
                            adjust: buildAdjustRangeForSelf(
                                comparisonType,
                                selfVer,
                            ),
                            original: selfVer,
                        })
                    }
                },
            },
            defineJsonVisitor({
                "dependencies, peerDependencies"(node) {
                    if (selfEngines.size === 0) {
                        return
                    }
                    const name = getKeyFromJSONProperty(node)
                    const ver = getStaticJSONValue(node.value)
                    if (typeof name !== "string" || typeof ver !== "string") {
                        return
                    }
                    const ctx = new EnginesContext(selfEngines.keys())
                    processDependencyModule(ctx, name, ver, [], node)
                },
            }),
        )
    },
})
