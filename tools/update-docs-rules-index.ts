import path from "path";
import fs from "fs";
import renderRulesTableContent from "./render-rules";

// -----------------------------------------------------------------------------
const readmeFilePath = path.resolve(__dirname, "../docs/rules/README.md");
fs.writeFileSync(
  readmeFilePath,
  `---
sidebarDepth: 0
---

# Available Rules

The \`--fix\` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.  
The rules with the following star :star: are included in the \`plugin:node-dependencies/recommended\` config.

<!-- This file is automatically generated in tools/update-docs-rules-index.js, do not change! -->
${renderRulesTableContent()}`
);
