import path from "node:path";
import fs from "node:fs";
import { rules } from "./lib/load-rules.ts";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const content = `import type { Linter } from "eslint";

export default {
    rules: {
        // eslint-plugin-node-dependencies rules
        ${rules
          .filter((rule) => rule.meta.docs.recommended && !rule.meta.deprecated)
          .map((rule) => {
            const conf = rule.meta.docs.default || "error";
            return `"${rule.meta.docs.ruleId}": "${conf}"`;
          })
          .join(",\n")}
    } as Linter.RulesRecord
}
`;

const filePath = path.resolve(dirname, "../lib/configs/rules/recommended.ts");

// Update file.
fs.writeFileSync(filePath, content);

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
