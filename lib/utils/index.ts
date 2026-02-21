import type { RuleModule, PartialRuleModule, RuleListener } from "../types.ts";

import type { AST } from "jsonc-eslint-parser";
import { getKey } from "./ast-utils.ts";

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
  };
}

/**
 * Define the JSON visitor rule.
 */
export function defineJsonVisitor(
  visitor: Record<string, ((node: AST.JSONProperty) => void) | undefined>,
): RuleListener {
  type ObjectStack = {
    node: AST.JSONObjectExpression | AST.JSONArrayExpression;
    upper: ObjectStack | null;
    key: string | number | null;
  };
  let stack: ObjectStack | null = null;

  const visitors: {
    test: (s: ObjectStack) => boolean;
    visit: (node: AST.JSONProperty) => void;
  }[] = [];
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
              return false;
            }
            return s.key === sel;
          },
          visit,
        });
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
      };
    },
    "JSONObjectExpression, JSONArrayExpression:exit"() {
      stack = stack && stack.upper;
    },
    JSONProperty(node: AST.JSONProperty) {
      if (!stack) {
        return;
      }
      for (const v of visitors) {
        if (v.test(stack)) {
          v.visit(node);
        }
      }
    },
  };
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
      const orig = visitor[key];
      if (orig) {
        visitor[key] = (...args: unknown[]) => {
          // @ts-expect-error -- ignore
          orig(...args);
          // @ts-expect-error -- ignore
          v[key](...args);
        };
      } else {
        visitor[key] = v[key];
      }
    }
  }
  return visitor;
}
