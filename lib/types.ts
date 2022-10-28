import type { JSONSchema4 } from "json-schema";
import type { Rule } from "eslint";

export interface RuleListener {
  [key: string]: ((node: never) => void) | undefined;
}

export interface RuleModule {
  meta: RuleMetaData;
  create: (context: Rule.RuleContext) => RuleListener;
}

export type RuleCategory =
  | "Possible Errors"
  | "Best Practices"
  | "Stylistic Issues";

export interface RuleMetaData {
  docs: {
    description: string;
    category: RuleCategory;
    recommended: boolean;
    url: string;
    ruleId: string;
    ruleName: string;
    default?: "error" | "warn";
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: string[];
  type: "problem" | "suggestion" | "layout";
}

export interface PartialRuleModule {
  meta: PartialRuleMetaData;
  create: (context: Rule.RuleContext) => RuleListener;
}

export interface PartialRuleMetaData {
  docs: {
    description: string;
    category: RuleCategory;
    recommended: boolean;
    default?: "error" | "warn";
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: string[];
  type: "problem" | "suggestion" | "layout";
}
