import type { RuleModule, PartialRuleModule } from "../types"
import { spawnSync } from "child_process"
import path from "path"
import fs from "fs"
import semver from "semver"
import Module from "module"
import type { Rule } from "eslint"

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

export type ModuleMeta = {
    engines?: Record<string, string | undefined>
    dependencies?: Record<string, string | undefined>
    peerDependencies?: Record<string, string | undefined>
    version?: string
}

/**
 * Get the meta info from given module name
 */
export function getMeta(
    name: string,
    ver: string,
    context: Rule.RuleContext,
): ModuleMeta | null {
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

    if (ver.startsWith("npm:")) {
        return getMetaFromNpm(`${ver.slice(4).replace(/\s/g, "")}`)
    }
    if (ver.includes("/") || ver.includes(":")) {
        return {} // unknown
    }

    return getMetaFromNpm(`${name}@${ver.replace(/\s/g, "")}`)
}

/**
 * Get the meta info from given module name
 */
function getMetaFromNpm(npmName: string): ModuleMeta | null {
    const cachedFilePath = path.join(
        __dirname,
        `../../.cached_meta/${npmName}.json`,
    )
    makeDirs(path.dirname(cachedFilePath))

    if (fs.existsSync(cachedFilePath)) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- ignore
        const { meta, timestamp } = require(cachedFilePath) as {
            meta: ModuleMeta
            timestamp: number
        }
        if (meta != null && typeof timestamp === "number") {
            if (timestamp + TTL >= Date.now()) {
                return meta
            }
            // Reload!
        }
    }

    let meta: ModuleMeta = {}
    try {
        const json = exec("npm", ["view", `${npmName}`, "--json"])
        meta = JSON.parse(json) as ModuleMeta
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
function maybeMeta(json: unknown): json is ModuleMeta {
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
