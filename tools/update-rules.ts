import path from "node:path";
import fs from "node:fs";
import { rules } from "./lib/load-rules.ts";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convert text to camelCase
 */
function camelCase(str: string) {
  return str.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ""));
}

const content = `
import type { RuleModule } from "../types"
${rules
  .map(
    (rule) =>
      `import ${camelCase(rule.meta.docs.ruleName)} from "../rules/${
        rule.meta.docs.ruleName
      }"`,
  )
  .join("\n")}

export const rules = [
    ${rules.map((rule) => camelCase(rule.meta.docs.ruleName)).join(",")}
] as RuleModule[]
`;

// Update file.
fs.writeFileSync(path.resolve(dirname, "../lib/utils/rules.ts"), content);

const namesContent = `
export const activeRuleNames = [
    ${rules
      .filter((rule) => !rule.meta.deprecated)
      .map((rule) => JSON.stringify(rule.meta.docs.ruleName))
      .join(",")}
]
export const deprecatedRuleNames = [
    ${rules
      .filter((rule) => rule.meta.deprecated)
      .map((rule) => JSON.stringify(rule.meta.docs.ruleName))
      .join(",")}
]
`;

// Update file.
fs.writeFileSync(
  path.resolve(dirname, "../lib/utils/rule-names.ts"),
  namesContent,
);

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
