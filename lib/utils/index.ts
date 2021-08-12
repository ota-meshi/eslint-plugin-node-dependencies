import type { RuleModule, PartialRuleModule, RuleListener } from "../types"
import { spawnSync } from "child_process"
import path from "path"
import fs from "fs"
import semver from "semver"
import Module from "module"
import type { Rule } from "eslint"
import type { AST } from "jsonc-eslint-parser"
import { getKey } from "./ast-utils"

const TTL = 1000 * 60 * 60 // 1h
/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
    ruleName: string,
    rule: PartialRuleModule,
): RuleModule {
    return {
        meta: {
            ...rule.meta,
            docs: {
                ...rule.meta.docs,
                url: `https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/${ruleName}.html`,
                ruleId: `node-dependencies/${ruleName}`,
                ruleName,
            },
        },
        create: rule.create as never,
    }
}

/**
 * Define the JSON visitor rule.
 */
export function defineJsonVisitor(
    visitor: Record<
        string | "dependencies" | "peerDependencies",
        ((node: AST.JSONProperty) => void) | undefined
    >,
): RuleListener {
    type ObjectStack = {
        node: AST.JSONObjectExpression | AST.JSONArrayExpression
        upper: ObjectStack | null
        key: string | number | null
    }
    let stack: ObjectStack | null = null

    const visitors: {
        test: (s: ObjectStack) => boolean
        visit: (node: AST.JSONProperty) => void
    }[] = []
    for (const [selector, visit] of Object.entries(visitor)) {
        if (visit) {
            for (const sel of selector.split(",").map((s) => s.trim())) {
                visitors.push({
                    test: (s) => {
                        if (
                            !s.key ||
                            !s.upper ||
                            s.upper.key != null // root
                        ) {
                            return false
                        }
                        return s.key === sel
                    },
                    visit,
                })
            }
        }
    }

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
            if (!stack) {
                return
            }
            for (const v of visitors) {
                if (v.test(stack)) {
                    v.visit(node)
                }
            }
        },
    }
}

/**
 * Composite all given visitors.
 */
export function compositingVisitors(
    visitor: RuleListener,
    ...visitors: RuleListener[]
): RuleListener {
    for (const v of visitors) {
        for (const key in v) {
            const orig = visitor[key]
            if (orig) {
                visitor[key] = (...args: unknown[]) => {
                    // @ts-expect-error -- ignore
                    orig(...args)
                    // @ts-expect-error -- ignore
                    v[key](...args)
                }
            } else {
                visitor[key] = v[key]
            }
        }
    }
    return visitor
}

export type PackageMeta = {
    engines?: Record<string, string | undefined>
    dependencies?: Record<string, string | undefined>
    peerDependencies?: Record<string, string | undefined>
    version?: string
}
export type NpmPackageMeta = PackageMeta & {
    deprecated?: string
}

/**
 * Get the meta info from given module name
 */
export function getMeta(
    name: string,
    ver: string,
    context: Rule.RuleContext,
): PackageMeta | null {
    try {
        const cwd = getCwd(context)
        const relativeTo = path.join(cwd, "__placeholder__.js")
        const req = Module.createRequire(relativeTo)
        const pkg = req(`${name}/package.json`)
        if (maybeMeta(pkg)) {
            const vr = getSemverRange(ver)
            if (
                typeof pkg.version === "string" &&
                (!vr || semver.satisfies(pkg.version, vr))
            ) {
                return pkg
            }
        }
    } catch (_e) {
        // console.log(_e)
        // ignore
    }

    return getMetaFromNpm(name, ver)
}
/**
 * Get the npm meta info from given module name and version
 */
export function getMetaFromNpm(
    name: string,
    ver: string,
): NpmPackageMeta | null {
    const cleanVer = ver.replace(/\s/g, "")

    if (cleanVer.startsWith("npm:")) {
        return getMetaFromNpmView(`${cleanVer.slice(4)}`)
    }
    if (cleanVer.includes("/") || cleanVer.includes(":")) {
        return {} // unknown
    }

    return getMetaFromNpmView(`${name}${cleanVer ? `@${cleanVer}` : ""}`)
}

/**
 * Get the meta info from given package-arg
 */
function getMetaFromNpmView(packageArg: string): NpmPackageMeta | null {
    const cachedFilePath = path.join(
        __dirname,
        `../../.cached_meta/${packageArg}.json`,
    )
    makeDirs(path.dirname(cachedFilePath))

    if (fs.existsSync(cachedFilePath)) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- ignore
        const { meta, timestamp } = require(cachedFilePath) as {
            meta: NpmPackageMeta
            timestamp: number
        }
        if (meta != null && typeof timestamp === "number") {
            if (timestamp + TTL >= Date.now() || meta.deprecated) {
                return meta
            }
            // Reload!
        }
    }

    let meta: NpmPackageMeta = {}
    try {
        const json = exec("npm", ["view", `${packageArg}`, "--json"])
        meta = JSON.parse(json)
        if (Array.isArray(meta)) {
            meta = meta[meta.length - 1]
        }
    } catch (e) {
        return null
    }
    fs.writeFileSync(
        cachedFilePath,
        JSON.stringify({
            meta,
            timestamp: Date.now(),
        }),
    )
    delete require.cache[cachedFilePath]
    return meta
}

/** Get the engines from given package.json value */
export function getEngines(meta: unknown): Map<string, string> {
    if (!maybeMeta(meta)) {
        return new Map<string, string>()
    }
    return getStrMap(meta.engines)
}

/** Get the dependencies from given package.json value */
export function getDependencies(
    meta: unknown,
    kind: "dependencies" | "peerDependencies",
): Map<string, string> {
    if (!maybeMeta(meta)) {
        return new Map<string, string>()
    }
    return getStrMap(meta[kind])
}

/** Get the semver range instance from given value */
export function getSemverRange(
    value: string | undefined | null,
): semver.Range | null {
    if (value == null) {
        return null
    }
    try {
        return new semver.Range(value)
    } catch {
        return null
    }
}

/** Strip extra spaces */
export function stripExtraSpaces(ver: string): string {
    return ver.replace(/\s+/g, (v) => v[0]).replace(/([<=>^|~])\s/, "$1")
}

/** Get the map from given value */
function getStrMap(maybeObject: unknown): Map<string, string> {
    const map = new Map<string, string>()
    if (
        typeof maybeObject !== "object" ||
        !maybeObject ||
        Array.isArray(maybeObject)
    ) {
        return map
    }
    for (const [key, val] of Object.entries(maybeObject)) {
        if (val != null) {
            map.set(key, `${val}`)
        }
    }
    return map
}

/**
 * Checks whether the given object is package.json meta data
 */
function maybeMeta(json: unknown): json is PackageMeta {
    if (typeof json !== "object" || !json || Array.isArray(json)) {
        return false
    }
    return true
}

/**
 * Make directories
 */
function makeDirs(dir: string) {
    const dirs = [dir]
    while (!fs.existsSync(dirs[0])) {
        dirs.unshift(path.dirname(dirs[0]))
    }
    dirs.shift()
    for (const d of dirs) {
        fs.mkdirSync(d)
    }
}

/** Execute command */
function exec(command: string, args: string[]) {
    const result = spawnSync(command, args, {
        windowsHide: true,
        maxBuffer: Infinity,
    })

    if (result.error) {
        throw result.error
    }
    if (result.status !== 0) {
        throw new Error(
            `Failed:\n${result.stdout.toString()}\n${result.stderr.toString()}`,
        )
    }
    return result.stdout.toString("utf8")
}

/** Get CWD */
function getCwd(context: Rule.RuleContext) {
    if (context.getCwd) {
        return context.getCwd()
    }
    return path.resolve("")
}
