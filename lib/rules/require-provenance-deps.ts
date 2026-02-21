import { createRule, defineJsonVisitor } from "../utils/index.ts";
import { getStaticJSONValue } from "jsonc-eslint-parser";
import { getKeyFromJSONProperty } from "../utils/ast-utils.ts";
import type { NpmPackageMeta } from "../utils/meta.ts";
import { getMetaFromNpm } from "../utils/meta.ts";

export default createRule("require-provenance-deps", {
  meta: {
    docs: {
      description: "Require provenance information for dependencies",
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
    messages: {
      missingProvenance:
        'Dependency "{{name}}" has versions without provenance information: {{versions}}.',
    },
    type: "suggestion", // "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const devDependencies = Boolean(context.options[0]?.devDependencies);

    /**
     * Extract version ranges without provenance information
     */
    function extractNoProvenanceRanges(
      meta: NpmPackageMeta[],
    ): [string, string][] {
      const noProvenanceRanges: [string, string][] = [];
      let prev: [string, string] | null = null;
      for (let index = 0; index < meta.length; index++) {
        const m = meta[index];
        if (m.dist?.attestations?.provenance) {
          prev = null;
          continue;
        }
        if (prev == null) {
          prev = [m.version!, m.version!];
          noProvenanceRanges.push(prev);
        } else {
          prev[1] = m.version!;
        }
      }
      return noProvenanceRanges;
    }

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
        if (!meta || !meta.length) {
          return;
        }
        const noProvenanceRanges = extractNoProvenanceRanges(meta);
        if (noProvenanceRanges.length === 0) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "missingProvenance",
          data: {
            name,
            versions: formatList(
              noProvenanceRanges.map(([from, to]) =>
                from === to ? `${from}` : `${from} - ${to}`,
              ),
            ),
          },
        });
      },
    });

    /**
     * Format list of strings into a human-readable string
     */
    function formatList(items: string[]): string {
      return items.length <= 2
        ? items.join(" and ")
        : `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
    }
  },
});
