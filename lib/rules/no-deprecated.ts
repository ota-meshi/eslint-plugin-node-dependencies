import { getStaticJSONValue } from "jsonc-eslint-parser";
import { createRule, defineJsonVisitor } from "../utils/index.ts";
import { getKeyFromJSONProperty } from "../utils/ast-utils.ts";
import { getMetaFromNpm } from "../utils/meta.ts";

export default createRule("no-deprecated", {
  meta: {
    docs: {
      description: "disallow having dependencies on deprecate packages.",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          devDependencies: { type: "boolean" },
          allows: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {},
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const devDependencies = Boolean(context.options[0]?.devDependencies);

    return defineJsonVisitor({
      [devDependencies
        ? "dependencies, peerDependencies, devDependencies"
        : "dependencies, peerDependencies"](node) {
        const name = getKeyFromJSONProperty(node);
        const ver = getStaticJSONValue(node.value);
        if (typeof name !== "string" || typeof ver !== "string" || !ver) {
          return;
        }
        if (context.options[0]?.allows?.includes(name)) {
          return;
        }
        const meta = getMetaFromNpm(name, ver).get();
        const deprecated =
          meta && meta.length && meta[meta.length - 1].deprecated;
        if (deprecated) {
          context.report({
            loc: node.loc,
            message: `${deprecated}`,
          });
        }
      },
    });
  },
});
