import { defineConfig, globalIgnores } from "eslint/config";
import myPlugin from "@ota-meshi/eslint-plugin";
import tsEslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".cached_meta",
    ".nyc_output",
    "coverage",
    "dist",
    "node_modules",
    "assets",
    "!.vscode",
    "!.github",
    "tests/fixtures/integrations/eslint-plugin",
    "!docs/.vitepress",
    "docs/.vitepress/dist/**/*",
    "docs/.vitepress/cache",
  ]),
  ...myPlugin.config({
    node: true,
    ts: true,
    eslintPlugin: true,
    json: true,
    packageJson: true,
    yaml: true,
    prettier: true,
    vue3: true,
  }),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "jsdoc/require-jsdoc": "error",
      "no-warning-comments": "warn",
      "no-lonely-if": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-shadow": "off",

      "node-dependencies/valid-engines": [
        "error",
        {
          deep: true,
          comparisonType: "major",
        },
      ],

      "node-dependencies/no-deprecated": ["error"],

      "no-restricted-properties": [
        "error",
        {
          object: "context",
          property: "parserServices",
          message: "Please use `context.sourceCode.parserServices` instead.",
        },
      ],
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "script",
    },
  },
  {
    files: ["**/*.{js,ts,mjc,mts,cjs,cts,vue}"],
    rules: {
      "n/prefer-node-protocol": "error",
      "n/file-extension-in-import": ["error", "always"],
      "@typescript-eslint/naming-convention": "off",
    },
    settings: {
      n: {
        typescriptExtensionMap: [],
      },
    },
  },
  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tsEslint.parser,
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    rules: {
      "no-implicit-globals": "off",

      "@typescript-eslint/no-shadow": "error",
    },
  },
  {
    files: ["lib/rules/**"],

    rules: {
      "eslint-plugin/report-message-format": ["error", "[^a-z].*\\.$"],
    },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts"],

    rules: {
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  {
    files: ["tests/lib/**/*.js"],
    rules: {},
  },
  {
    files: ["**/*.vue"],

    languageOptions: {
      globals: {
        require: true,
      },
      sourceType: "module",
    },
  },
  {
    files: ["docs/.vitepress/**"],
    extends: [tsEslint.configs.disableTypeChecked],

    languageOptions: {
      globals: {
        window: true,
      },

      sourceType: "module",

      parserOptions: {
        project: null,
      },
    },

    rules: {
      "jsdoc/require-jsdoc": "off",
    },
  },
]);
