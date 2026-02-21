import Module from "node:module";
import path from "node:path";
import fs from "node:fs";
import type { Rule } from "eslint";
import { getSemverRange, maxNextVersion } from "./semver.ts";
import { satisfies } from "semver";
import npa from "npm-package-arg";
import { syncPackageJson } from "./package-json/index.ts";
import { fileURLToPath } from "node:url";

const TTL = 1000 * 60 * 60; // 1h

export type PackageMeta = {
  engines: Record<string, string | undefined> | undefined;
  dependencies: Record<string, string | undefined> | undefined;
  peerDependencies: Record<string, string | undefined> | undefined;
  optionalDependencies: Record<string, string | undefined> | undefined;
  version: string | undefined;
  _where?: string;
};
export type NpmPackageMeta = PackageMeta & {
  deprecated: string | undefined;
  "dist-tags": { [key: string]: string | void } | undefined;
  dist?: {
    attestations?: {
      provenance?: Record<string, unknown>;
    };
  };
};

const CACHE_VERSION = 2;

type CachedFileContent = {
  v: typeof CACHE_VERSION;
  meta: NpmPackageMeta[];
  timestamp?: number;
  expired?: number;
};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHED_META_ROOT = path.join(dirname, `../../.cached_meta`);

/**
 * Get the meta info from given module name
 */
export function getMetaFromNodeModules(
  name: string,
  ver: string,
  options: { context: Rule.RuleContext; ownerPackageJsonPath?: string },
): PackageMeta | null {
  try {
    const ownerJsonPath =
      options.ownerPackageJsonPath || options.context.filename;
    const relativeTo = path.join(
      ownerJsonPath && path.isAbsolute(ownerJsonPath)
        ? path.dirname(ownerJsonPath)
        : options.context.cwd,
      "__placeholder__.js",
    );
    const req = Module.createRequire(relativeTo);
    const where = req.resolve(`${name}/package.json`);
    const pkg = req(where);
    if (maybeMeta(pkg)) {
      const vr = getSemverRange(ver);
      if (
        typeof pkg.version === "string" &&
        (!vr || satisfies(pkg.version, vr))
      ) {
        pkg._where = where;
        return pkg;
      }
    }
  } catch {
    // console.log(_e)
    // ignore
  }
  return null;
}

/**
 * Get the npm meta info from given module name and version
 */
export function getMetaFromNpm(
  name: string,
  ver: string,
): {
  cache: NpmPackageMeta[];
  get: () => NpmPackageMeta[] | null;
} {
  const trimmed = ver.trim();
  if (trimmed.startsWith("npm:")) {
    let parsed: npa.Result | null = null;
    try {
      parsed = npa(`${trimmed.slice(4).trim()}`);
    } catch {
      // ignore
    }
    if (
      parsed &&
      (parsed.type === "range" ||
        parsed.type === "version" ||
        parsed.type === "tag")
    ) {
      return getMetaFromNameAndSpec(parsed.name!, parsed.fetchSpec?.trim());
    }
  }
  if (trimmed.includes("/") || trimmed.includes(":")) {
    // unknown
    return { cache: [], get: () => [] };
  }

  return getMetaFromNameAndSpec(name, ver.trim());
}

/**
 * Get the meta info from npm registry with given package name and spec
 */
function getMetaFromNameAndSpec(
  name: string,
  verOrTag: string | undefined,
): {
  cache: NpmPackageMeta[];
  get: () => NpmPackageMeta[] | null;
} {
  const cachedFilePath = path.join(CACHED_META_ROOT, `${name}.json`);
  const { cache, get } = getMetaFromName(name, cachedFilePath);

  let isTargetVersion: (meta: NpmPackageMeta) => boolean;

  let hasUnknown = false;
  const range = getSemverRange(verOrTag || "*");
  if (range) {
    isTargetVersion = (meta: NpmPackageMeta) => {
      if (!meta.version) {
        return true;
      }
      return range.test(meta.version);
    };
  } else {
    const parsed = npa.resolve(name, verOrTag!);
    if (parsed.type === "tag") {
      isTargetVersion = (meta: NpmPackageMeta) => {
        if (!meta.version) {
          return true;
        }
        const v = meta["dist-tags"]?.[parsed.fetchSpec];
        if (v == null) {
          hasUnknown = true;
        }
        return v === meta.version;
      };
    } else {
      return {
        cache: [],
        get: () => null,
      };
    }
  }

  if (cache) {
    let alive = cache.alive;
    if (!alive && range) {
      const maxNext = maxNextVersion(range);
      if (maxNext) {
        alive = cache.data.meta.some(
          (m) => m.version && maxNext.compare(m.version) <= 0,
        );
      }
    }

    const metaList = cache.data.meta.filter(isTargetVersion);
    if (alive) {
      return {
        cache: metaList,
        get: () => (hasUnknown ? null : metaList),
      };
    }
    return {
      cache: metaList,
      get: () => {
        const list = get()?.filter(isTargetVersion) ?? null;
        return hasUnknown && !list?.length ? null : list;
      },
    };
  }
  return {
    cache: [],
    get: () => {
      const list = get()?.filter(isTargetVersion) ?? null;
      return hasUnknown && !list?.length ? null : list;
    },
  };
}

/**
 * Get the meta info from given package name
 */
function getMetaFromName(
  name: string,
  cachedFilePath: string,
): {
  cache: {
    data: CachedFileContent;
    alive: boolean;
  } | null;
  get: () => NpmPackageMeta[] | null;
} {
  const cache = getCache();

  return {
    cache,
    get: () => {
      return getMetaFromNameWithoutCache(name, cachedFilePath);
    },
  };

  /** Get from cache */
  function getCache(): {
    data: CachedFileContent;
    alive: boolean;
  } | null {
    makeDirs(path.dirname(cachedFilePath));

    if (!fs.existsSync(cachedFilePath)) {
      return null;
    }
    const data: CachedFileContent | null = JSON.parse(
      fs.readFileSync(cachedFilePath, "utf8"),
    );
    if (!data || data.meta == null) {
      return null;
    }
    if (data.v !== CACHE_VERSION) {
      // Version mismatch
      return null;
    }
    const alive = Boolean(
      (typeof data.expired === "number" && data.expired >= Date.now()) ||
      (typeof data.timestamp === "number" &&
        data.timestamp + TTL >= Date.now()) ||
      (data.meta.length === 1 && data.meta[0].deprecated),
    );

    return {
      data,
      alive,
    };
  }
}

/**
 * Get the meta info from given package name
 */
function getMetaFromNameWithoutCache(
  name: string,
  cachedFilePath: string,
): NpmPackageMeta[] | null {
  let meta: NpmPackageMeta[] = [];
  try {
    // const start = performance.now()
    const allMeta = syncPackageJson(name);
    // const end = performance.now()
    // console.log(name, `${end - start}ms`)

    meta = Object.values(allMeta.versions).map((vm): NpmPackageMeta => {
      return {
        version: vm.version,
        engines: vm.engines,
        dependencies: vm.dependencies,
        peerDependencies: vm.peerDependencies,
        optionalDependencies: vm.optionalDependencies,
        "dist-tags": allMeta["dist-tags"],
        deprecated: vm.deprecated,
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Empty object
        dist: vm.dist as {},
      };
    });
  } catch {
    return null;
  }
  const timestamp = Date.now();
  const content: CachedFileContent = {
    v: CACHE_VERSION,
    meta,
    timestamp,
    expired: timestamp + Math.floor(Math.random() * 1000 * 60 /* 1m */),
  };
  fs.writeFileSync(cachedFilePath, JSON.stringify(content));
  return meta;
}

/** Get the engines from given package.json value */
export function getEngines(meta: unknown): Map<string, string> {
  if (!maybeMeta(meta)) {
    return new Map<string, string>();
  }
  return getStrMap(meta.engines);
}

/** Get the dependencies from given package.json value */
export function getDependencies(
  meta: unknown,
  kind: "dependencies" | "peerDependencies" | "optionalDependencies",
): Map<string, string> {
  if (!maybeMeta(meta)) {
    return new Map<string, string>();
  }
  return getStrMap(meta[kind]);
}

/** Get the map from given value */
function getStrMap(maybeObject: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (
    typeof maybeObject !== "object" ||
    !maybeObject ||
    Array.isArray(maybeObject)
  ) {
    return map;
  }
  for (const [key, val] of Object.entries(maybeObject)) {
    if (val != null) {
      map.set(key, `${val}`);
    }
  }
  return map;
}

/**
 * Checks whether the given object is package.json meta data
 */
function maybeMeta(json: unknown): json is PackageMeta {
  if (typeof json !== "object" || !json || Array.isArray(json)) {
    return false;
  }
  return true;
}

/**
 * Make directories
 */
function makeDirs(dir: string) {
  const dirs = [dir];
  while (!fs.existsSync(dirs[0])) {
    dirs.unshift(path.dirname(dirs[0]));
  }
  dirs.shift();
  for (const d of dirs) {
    fs.mkdirSync(d);
  }
}
