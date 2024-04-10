import path from "path";
import fs from "fs";
// import eslint from "eslint"
import { rules } from "./lib/load-rules";

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

const filePath = path.resolve(__dirname, "../lib/configs/rules/recommended.ts");

// Update file.
fs.writeFileSync(filePath, content);

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
