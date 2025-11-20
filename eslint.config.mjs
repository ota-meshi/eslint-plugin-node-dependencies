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
    "tests/fixtures/integrations/eslint-plugin-legacy-config",
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
          message:
            "Please use `context.getSourceCode().parserServices` instead.",
        },
        {
          object: "context",
          property: "getSourceCode",
          message:
            "Please use `eslint-compat-utils` module's `getSourceCode(context)` instead.",
        },
        {
          object: "context",
          property: "getFilename",
          message:
            "Please use `eslint-compat-utils` module's `getFilename(context)` instead.",
        },
        {
          object: "context",
          property: "getCwd",
          message:
            "Please use `eslint-compat-utils` module's `getCwd(context)` instead.",
        },
        {
          object: "context",
          property: "getScope",
          message:
            "Please use `eslint-compat-utils` module's `getSourceCode(context).getScope()` instead.",
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
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "property",
          format: null,

          custom: {
            regex: "[\\w _,]",
            match: true,
          },
        },
        {
          selector: "method",
          format: null,

          custom: {
            regex: "[\\w _,]",
            match: true,
          },
        },
        {
          selector: "import",
          format: null,
        },
      ],
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
