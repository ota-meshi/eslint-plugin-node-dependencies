import { getStaticJSONValue } from "jsonc-eslint-parser";
import type { JSONProperty } from "jsonc-eslint-parser/lib/parser/ast";
import type { Range } from "semver";
import { createRule, defineJsonVisitor } from "../utils";
import { getKeyFromJSONProperty } from "../utils/ast-utils";
import { toRegExp } from "../utils/regexp";
import { getSemverRange, isAnyComparator } from "../utils/semver";

const PREFERS = ["always" as const, "never" as const, "ignore" as const];
const SCHEMA_FOR_DEPS_PROPERTIES = {
  dependencies: { enum: PREFERS },
  peerDependencies: { enum: PREFERS },
  optionalDependencies: { enum: PREFERS },
  devDependencies: { enum: PREFERS },
};
type Prefer = (typeof PREFERS)[number];
type FullOption = {
  dependencies: Prefer;
  peerDependencies: Prefer;
  optionalDependencies: Prefer;
  devDependencies: Prefer;
};

const DEFAULT: FullOption = {
  dependencies: "ignore",
  peerDependencies: "ignore",
  optionalDependencies: "ignore",
  devDependencies: "always",
};

/**
 * Convert from string option to object option
 */
function stringToOption(option: Prefer): FullOption {
  return {
    dependencies: option,
    peerDependencies: option,
    optionalDependencies: option,
    devDependencies: option,
  };
}

/**
 * Convert from object option to object option
 */
function objectToOption(
  option: Partial<FullOption>,
  defaults: FullOption,
): FullOption {
  return {
    dependencies: option.dependencies || defaults.dependencies,
    peerDependencies: option.peerDependencies || defaults.peerDependencies,
    optionalDependencies:
      option.optionalDependencies || defaults.optionalDependencies,
    devDependencies: option.devDependencies || defaults.devDependencies,
  };
}

/**
 * Parse option
 */
function parseOption(
  option:
    | null
    | Prefer
    | (Partial<FullOption> & {
        overridePackages?: Record<string, Prefer | Partial<FullOption>>;
      }),
): (packageName: string) => FullOption {
  if (!option) {
    return () => DEFAULT;
  }
  if (typeof option === "string") {
    const objectOption = stringToOption(option);
    return () => objectOption;
  }
  const baseOption = objectToOption(option, DEFAULT);
  if (!option.overridePackages) {
    return () => baseOption;
  }
  const overridePackages = Object.entries(option.overridePackages).map(
    ([packageName, opt]) => {
      const regexp = toRegExp(packageName);
      return {
        test: (s: string) => regexp.test(s),
        ...(typeof opt === "string"
          ? stringToOption(opt)
          : objectToOption(opt, baseOption)),
      };
    },
  );

  return (name) => {
    for (const overridePackage of overridePackages) {
      if (overridePackage.test(name)) {
        return overridePackage;
      }
    }

    return baseOption;
  };
}

export default createRule("absolute-version", {
  meta: {
    docs: {
      description: "require or disallow absolute version of dependency.",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        oneOf: [
          { enum: PREFERS.filter((p) => p !== "ignore") },
          {
            type: "object",
            properties: {
              ...SCHEMA_FOR_DEPS_PROPERTIES,
              overridePackages: {
                type: "object",
                patternProperties: {
                  "^(?:\\S+)$": {
                    oneOf: [
                      { enum: PREFERS },
                      {
                        type: "object",
                        properties: SCHEMA_FOR_DEPS_PROPERTIES,
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                minProperties: 1,
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
    messages: {},
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const getOption = parseOption(context.options[0]);

    /** Define dependency visitor */
    function defineVisitor(
      visitName:
        | "dependencies"
        | "peerDependencies"
        | "optionalDependencies"
        | "devDependencies",
    ) {
      return (node: JSONProperty) => {
        const ver = getStaticJSONValue(node.value);
        if (typeof ver !== "string" || ver == null) {
          return;
        }
        const name = String(getKeyFromJSONProperty(node));
        const option = getOption(name)[visitName];

        const semver = getSemverRange(ver);
        if (semver == null) {
          return;
        }
        if (option === "always") {
          if (isAbsoluteVersion(semver)) {
            return;
          }
          context.report({
            loc: node.value.loc,
            message: "Use the absolute version instead.",
          });
        } else if (option === "never") {
          if (!isAbsoluteVersion(semver)) {
            return;
          }
          context.report({
            loc: node.value.loc,
            message: "Do not use the absolute version.",
          });
        }
      };
    }

    return defineJsonVisitor({
      dependencies: defineVisitor("dependencies"),
      peerDependencies: defineVisitor("peerDependencies"),
      optionalDependencies: defineVisitor("optionalDependencies"),
      devDependencies: defineVisitor("devDependencies"),
    });
  },
});

/** Checks whether the given semver is absolute version or not */
function isAbsoluteVersion(semver: Range) {
  for (const comparators of semver.set) {
    for (const comparator of comparators) {
      if (isAnyComparator(comparator)) {
        return false;
      }
      if (comparator.operator !== "=" && comparator.operator !== "") {
        return false;
      }
    }
  }
  return true;
}
