import Module from "module"
import { spawnSync } from "child_process"
import path from "path"
import fs from "fs"
import type { Rule } from "eslint"
import { getSemverRange, maxNextVersion } from "./semver"
import type { SemVer } from "semver"
import { minVersion, satisfies } from "semver"
import npa from "npm-package-arg"

const TTL = 1000 * 60 * 60 // 1h

export type PackageMeta = {
    engines?: Record<string, string | undefined>
    dependencies?: Record<string, string | undefined>
    peerDependencies?: Record<string, string | undefined>
    version?: string
}
export type NpmPackageMeta = PackageMeta & {
    deprecated?: string
    "dist-tags"?: { [key: string]: string | void }
}

type CachedFileContent = {
    meta: NpmPackageMeta[]
    timestamp?: number
    expired?: number
    minVersion?: string
}

const NPM_INFO_PROPERTIES: (keyof NpmPackageMeta)[] = [
    "version",
    "engines",
    "deprecated",
    "dependencies",
    "peerDependencies",
    "dist-tags",
]

const CACHED_META_ROOT = path.join(__dirname, `../../.cached_meta`)

/**
 * Get the meta info from given module name
 */
export function getMetaFromNodeModules(
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
                (!vr || satisfies(pkg.version, vr))
            ) {
                return pkg
            }
        }
    } catch (_e) {
        // console.log(_e)
        // ignore
    }
    return null
}

/**
 * Get the npm meta info from given module name and version
 */
export function getMetaFromNpm(
    name: string,
    ver: string,
): { cache: NpmPackageMeta[]; get: () => NpmPackageMeta[] | null } {
    const trimmed = ver.trim()
    if (trimmed.startsWith("npm:")) {
        let parsed: npa.Result | null = null
        try {
            parsed = npa(`${trimmed.slice(4).trim()}`)
        } catch {
            // ignore
        }
        if (
            parsed &&
            (parsed.type === "range" ||
                parsed.type === "version" ||
                parsed.type === "tag")
        ) {
            return getMetaFromNpmView(parsed.name!, parsed.fetchSpec?.trim())
        }
    }
    if (trimmed.includes("/") || trimmed.includes(":")) {
        // unknown
        return { cache: [], get: () => [] }
    }

    return getMetaFromNpmView(name, ver.trim())
}

/**
 * Get the meta info from npm view with given module
 */
function getMetaFromNpmView(
    name: string,
    verOrTag: string | undefined,
): {
    cache: NpmPackageMeta[]
    get: () => NpmPackageMeta[] | null
} {
    const range = getSemverRange(verOrTag)
    if (range) {
        const min = minVersion(range)
        if (min) {
            // eslint-disable-next-line func-style -- ignore
            const isTargetVersion = (meta: NpmPackageMeta) => {
                if (!meta.version) {
                    return true
                }
                return range.test(meta.version)
            }
            const cachedFilePath = path.join(CACHED_META_ROOT, `${name}.json`)
            const { cache, get } = getMetaFromNpmViewWithPackageArg(
                (minVer) => `${name}@>=${minVer}`,
                cachedFilePath,
                min,
            )
            if (cache) {
                const metaList = cache.data.meta.filter(isTargetVersion)
                let alive = cache.alive
                if (!alive) {
                    const maxNext = maxNextVersion(range)
                    if (maxNext) {
                        alive = cache.data.meta.some(
                            (m) => m.version && maxNext.compare(m.version) <= 0,
                        )
                    }
                }
                if (alive) {
                    return {
                        cache: metaList,
                        get: () => metaList,
                    }
                }
                return {
                    cache: metaList,
                    get: () => get()?.filter(isTargetVersion) ?? null,
                }
            }
            return {
                cache: [],
                get: () => get()?.filter(isTargetVersion) ?? null,
            }
        }
    }
    const packageArg = `${name}@${verOrTag || "*"}`
    const cachedFilePath = path.join(
        CACHED_META_ROOT,
        `${packageArg
            .replace(/[^\d+\-./<=>@\\^a-z|~]/giu, "_")
            .toLowerCase()}.json`,
    )
    const { cache, get } = getMetaFromNpmViewWithPackageArg(
        () => packageArg,
        cachedFilePath,
    )
    if (cache) {
        if (cache.alive) {
            return {
                cache: cache.data.meta,
                get: () => cache.data.meta,
            }
        }
        return {
            cache: cache.data.meta,
            get,
        }
    }
    return {
        cache: [],
        get,
    }
}

/**
 * Get the meta info from given package-arg
 */
function getMetaFromNpmViewWithPackageArg(
    getPackageArg: (min: string | undefined) => string,
    cachedFilePath: string,
    min?: SemVer,
): {
    cache: {
        data: CachedFileContent
        alive: boolean
    } | null
    get: () => NpmPackageMeta[] | null
} {
    let minVer = min?.version
    const cache = getCache()
    if (cache?.data.minVersion) {
        minVer = cache.data.minVersion
    }
    return {
        cache: getCache(),
        get: () =>
            getMetaFromNpmViewWithPackageArgWithoutCache(
                getPackageArg(minVer),
                cachedFilePath,
                minVer,
            ),
    }

    /** Get from cache */
    function getCache(): {
        data: CachedFileContent
        alive: boolean
    } | null {
        makeDirs(path.dirname(cachedFilePath))

        if (!fs.existsSync(cachedFilePath)) {
            return null
        }
        const data =
            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- ignore
            require(cachedFilePath) as CachedFileContent
        if (data.meta == null) {
            return null
        }
        if (min) {
            if (!data.minVersion) {
                return null
            }
            if (min.compare(data.minVersion) < 0) {
                return null
            }
        }
        const alive = Boolean(
            (typeof data.expired === "number" && data.expired >= Date.now()) ||
                (typeof data.timestamp === "number" &&
                    data.timestamp + TTL >= Date.now()) ||
                (data.meta.length === 1 && data.meta[0].deprecated),
        )

        return {
            data,
            alive,
        }
    }
}

/**
 * Get the meta info from given package-arg
 */
function getMetaFromNpmViewWithPackageArgWithoutCache(
    packageArg: string,
    cachedFilePath: string,
    minVer?: string,
): NpmPackageMeta[] | null {
    let meta: NpmPackageMeta[] = []
    try {
        const json = exec("npm", [
            "view",
            `${packageArg}`,
            ...NPM_INFO_PROPERTIES,
            "--json",
        ])
        meta = JSON.parse(json)
        if (!Array.isArray(meta)) {
            meta = [meta]
        }
    } catch (e) {
        return null
    }
    const timestamp = Date.now()
    const content: CachedFileContent = {
        meta,
        timestamp,
        expired: timestamp + Math.floor(Math.random() * 1000 * 60 /* 1m */),
        minVersion: minVer,
    }
    fs.writeFileSync(cachedFilePath, JSON.stringify(content))
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
