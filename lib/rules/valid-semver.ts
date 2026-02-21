import { getStaticJSONValue } from "jsonc-eslint-parser";
import { createRule, defineJsonVisitor } from "../utils/index.ts";
import { getKeyFromJSONProperty } from "../utils/ast-utils.ts";
import { getSemverRange } from "../utils/semver.ts";

export default createRule("valid-semver", {
  meta: {
    docs: {
      description: "enforce versions that is valid as a semantic version.",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [],
    messages: {},
    type: "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }

    return defineJsonVisitor({
      engines(node) {
        const ver = getStaticJSONValue(node.value);
        if (typeof ver !== "string" || ver == null) {
          context.report({
            loc: node.value.loc,
            message: `\`${JSON.stringify(ver)}\` is invalid.`,
          });
          return;
        }
        if (getSemverRange(ver) == null) {
          context.report({
            loc: node.value.loc,
            message: `"${ver}" is invalid.`,
          });
        }
      },
      "dependencies, peerDependencies, devDependencies, optionalDependencies"(
        node,
      ) {
        const name = getKeyFromJSONProperty(node);
        if (typeof name !== "string") {
          return;
        }
        const ver = getStaticJSONValue(node.value);
        if (typeof ver !== "string" || ver == null) {
          context.report({
            loc: node.value.loc,
            message: `\`${JSON.stringify(ver)}\` is invalid.`,
          });
          return;
        }
        if (maybeNotRange(ver)) {
          return;
        }
        if (getSemverRange(ver) == null) {
          context.report({
            loc: node.value.loc,
            message: `"${ver}" is invalid.`,
          });
        }
      },
    });
  },
});

/** Checks whether the given version string is not version range */
function maybeNotRange(ver: string): boolean {
  if (ver.startsWith(".") || ver.startsWith("~") || ver.includes("/")) {
    // Maybe local path https://docs.npmjs.com/cli/v11/configuring-npm/package-json#local-paths
    return true;
  }
  if (ver.includes(":")) {
    // Maybe protocols e.g. `file:`, `http:`, `git:`, and `npm:`
    return true;
  }
  if (/^[-a-z]+$/.test(ver)) {
    // Maybe identify e.g. `latest`, `next`, and `beta`
    return true;
  }
  return false;
}
