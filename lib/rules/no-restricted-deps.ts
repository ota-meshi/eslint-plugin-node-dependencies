import { createRule, defineJsonVisitor } from "../utils";
import { toRegExp } from "../utils/regexp";
import type { Range } from "semver";
import { intersects } from "semver";
import {
  getSemverRange,
  normalizeSemverRange,
  normalizeVer,
} from "../utils/semver";
import type { JSONProperty } from "jsonc-eslint-parser/lib/parser/ast";
import { getKeyFromJSONProperty } from "../utils/ast-utils";
import { getStaticJSONValue } from "jsonc-eslint-parser";
import type { PackageMeta } from "../utils/meta";
import { getMetaFromNodeModules, getMetaFromNpm } from "../utils/meta";
import type { Rule } from "eslint";

const DEPS = [
  "dependencies",
  "peerDependencies",
  "optionalDependencies",
] as const;

type Option = {
  package: string;
  version?: string;
  message?: string;
  deep?: "local" | "server";
};

type ValidateResult = { message: string };
type Validate = (packageName: string, version: string) => ValidateResult | null;

class Deps {
  private readonly map: Record<
    string,
    { range: Range; ownerPackageJsonPath?: string }
  > = Object.create(null);

  private readonly list: {
    name: string;
    ver: string;
    ownerPackageJsonPath?: string;
  }[] = [];

  public push(name: string, ver: string, ownerPackageJsonPath?: string) {
    const range = getSemverRange(ver);
    if (range) {
      const data = this.map[name];
      if (data) {
        const newRange = normalizeSemverRange(data.range, range)!;
        this.map[name] = {
          range: newRange,
          ownerPackageJsonPath:
            ownerPackageJsonPath || data.ownerPackageJsonPath,
        };
      } else {
        this.map[name] = {
          range,
          ownerPackageJsonPath,
        };
      }
      return;
    }

    this.list.push({ name, ver, ownerPackageJsonPath });
  }

  public pop(): {
    name: string;
    ver: string;
    ownerPackageJsonPath?: string;
  } | null {
    const resultForList = this.list.shift();
    if (resultForList) {
      return resultForList;
    }
    const [key] = Object.keys(this.map);
    if (key) {
      const data = this.map[key];
      delete this.map[key];
      return {
        name: key,
        ver: normalizeVer(data.range),
        ownerPackageJsonPath: data.ownerPackageJsonPath,
      };
    }
    return null;
  }
}
class DeepValidateContext {
  private readonly deepValidatedCache = new Map<
    string,
    ValidateResult | null
  >();

  private readonly context: Rule.RuleContext;

  private readonly validator: Validate;

  public constructor(context: Rule.RuleContext, validator: Validate) {
    this.context = context;
    this.validator = validator;
  }

  public buildDeepValidator(deepOption: "local" | "server"): Validate {
    return (n, v) => this.deepDepsValidate(n, v, deepOption);
  }

  /**
   * Deep dependency validate
   */
  private deepDepsValidate(
    packageName: string,
    version: string,
    deepOption: "local" | "server"
  ): ValidateResult | null {
    const { validator: validate, context } = this;
    const depsQueue = new Deps();
    depsQueue.push(packageName, version);

    let dep;
    while ((dep = depsQueue.pop())) {
      const key = `${dep.name}@${dep.ver}`;
      if (this.deepValidatedCache.has(key)) {
        const result = this.deepValidatedCache.get(key);
        if (result) {
          return result;
        }
      } else {
        const result = validateWithoutCache(
          dep.name,
          dep.ver,
          dep.ownerPackageJsonPath
        );
        this.deepValidatedCache.set(key, result);
        if (result) {
          return result;
        }
      }
    }

    return null;

    /**
     * Dependency validate
     */
    function validateWithoutCache(
      name: string,
      ver: string,
      ownerPackageJsonPath?: string
    ): ValidateResult | null {
      const result = validate(name, ver);
      if (result) {
        return result;
      }
      for (const { name: n, ver: v, packageJsonPath } of iterateDeps(
        name,
        ver,
        ownerPackageJsonPath
      )) {
        const r = validate(n, v);
        if (r) {
          return r;
        }
        depsQueue.push(n, v, packageJsonPath);
      }
      return null;
    }

    /** Iterate deps */
    function* iterateDeps(
      name: string,
      ver: string,
      ownerPackageJsonPath?: string
    ) {
      yield* iterateDepsForMeta(
        getMetaFromNodeModules(name, ver, {
          context,
          ownerPackageJsonPath,
        })
      );
      if (deepOption === "server") {
        const metaData = getMetaFromNpm(name, ver);
        for (const meta of metaData.cache) {
          yield* iterateDepsForMeta(meta);
        }
        const metaList = metaData.get();
        if (metaList) {
          for (const meta of metaList) {
            yield* iterateDepsForMeta(meta);
          }
        }
      }
    }

    /** Iterate deps */
    function* iterateDepsForMeta(meta: PackageMeta | null) {
      if (!meta) {
        return;
      }
      for (const depName of DEPS) {
        const deps = meta[depName];
        if (!deps) {
          continue;
        }
        for (const [n, v] of Object.entries(deps)) {
          if (typeof v === "string") {
            yield { name: n, ver: v, packageJsonPath: meta._where };
          }
        }
      }
    }
  }
}

export default createRule("no-restricted-deps", {
  meta: {
    docs: {
      description: "Disallows dependence on the specified package.",
      category: "Best Practices",
      recommended: false,
    },
    schema: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "object",
            properties: {
              package: { type: "string" },
              version: { type: "string" },
              message: { type: "string" },
              deep: { enum: ["local", "server"] },
            },
            required: ["package"],
            additionalProperties: false,
          },
        ],
      },
      uniqueItems: true,
      minItems: 0,
    },
    messages: {
      restricted: "{{message}}",
    },
    type: "suggestion",
  },
  create(context) {
    if (!context.parserServices.isJSON) {
      return {};
    }

    const validateForPackage = parseOptions(context.options);

    /** Define dependency visitor */
    function defineVisitor(_depsName: string) {
      return (node: JSONProperty) => {
        const name = String(getKeyFromJSONProperty(node));
        const ver = String(getStaticJSONValue(node.value));

        const result = validateForPackage(name, ver);
        if (!result) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "restricted",
          data: result,
        });
      };
    }

    return defineJsonVisitor({
      dependencies: defineVisitor("dependencies"),
      peerDependencies: defineVisitor("peerDependencies"),
      optionalDependencies: defineVisitor("optionalDependencies"),
      devDependencies: defineVisitor("devDependencies"),
    });

    /** Checks whether the given vers are match or not */
    function matchVersions(version: string, optionVersion: Range | null) {
      if (!optionVersion) {
        // match all
        return true;
      }
      const range = getSemverRange(version);
      return Boolean(range && intersects(range, optionVersion));
    }

    /**
     * Parse option
     */
    function parseOption(option: string | Option): Validate {
      if (typeof option === "string") {
        const regexp = toRegExp(option);
        return (n, _v) => {
          if (regexp.test(n)) {
            return {
              message: `Depend on '${option}' is not allowed.`,
            };
          }
          return null;
        };
      }
      const regexp = toRegExp(option.package);
      const version = option.version ? getSemverRange(option.version) : null;

      // eslint-disable-next-line func-style -- ignore
      const validator: Validate = (n, v) => {
        if (regexp.test(n) && matchVersions(v, version)) {
          return {
            message: option.message || buildDefaultMessage(option),
          };
        }
        return null;
      };

      if (!option.deep) {
        return validator;
      }

      const deepValidateContext = new DeepValidateContext(context, validator);

      return deepValidateContext.buildDeepValidator(option.deep);

      /** Build default message for object option */
      function buildDefaultMessage(objectOption: Option) {
        const versionForMessage = objectOption.version
          ? `@${objectOption.version}`
          : "";
        if (objectOption.package.startsWith("/") && versionForMessage) {
          return `Depend on '${objectOption.package} ${versionForMessage}' is not allowed.`;
        }
        return `Depend on '${objectOption.package}${versionForMessage}' is not allowed.`;
      }
    }

    /**
     * Parse options
     */
    function parseOptions(options: (string | Option)[]): Validate {
      const validators = options.map(parseOption);

      return (packageName, version) => {
        for (const validator of validators) {
          const result = validator(packageName, version);
          if (result) return result;
        }
        return null;
      };
    }
  },
});
