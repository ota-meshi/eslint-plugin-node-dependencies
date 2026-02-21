import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
async function readRules() {
  const rulesLibRoot = path.resolve(dirname, "../../lib/rules");
  const result = fs.readdirSync(rulesLibRoot);
  const rules = [];
  for (const name of result) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `node-dependencies/${ruleName}`;
    const rule = (await import(path.join(rulesLibRoot, name))).default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  return rules;
}

export const rules = await readRules();
