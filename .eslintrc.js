"use strict";

module.exports = {
  parserOptions: {
    sourceType: "script",
    ecmaVersion: 2020,
  },
  extends: [
    "plugin:@ota-meshi/recommended",
    "plugin:@ota-meshi/+node",
    "plugin:@ota-meshi/+typescript",
    "plugin:@ota-meshi/+eslint-plugin",
    "plugin:@ota-meshi/+json",
    "plugin:@ota-meshi/+package-json",
    "plugin:@ota-meshi/+yaml",
    // "plugin:@ota-meshi/+md",
    "plugin:@ota-meshi/+prettier",
  ],
  rules: {
    "require-jsdoc": "error",
    "no-warning-comments": "warn",
    "no-lonely-if": "off",
    "@typescript-eslint/no-non-null-assertion": "off",

    "no-shadow": "off", // ts bug?
    "@typescript-eslint/no-shadow": "error",
    "node-dependencies/valid-engines": [
      "error",
      {
        deep: true,
        comparisonType: "major",
      },
    ],
    "node-dependencies/no-deprecated": [
      "error",
      //    {devDependencies:true}
    ],
    "no-restricted-properties": [
      "error",
      {
        object: "context",
        property: "parserServices",
        message: "Please use `context.getSourceCode().parserServices` instead.",
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
      rules: {
        "no-implicit-globals": "off",
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
            format: null, // ["camelCase", "UPPER_CASE", "PascalCase"],
            custom: {
              regex: "[\\w _,]",
              match: true,
            },
          },
          {
            selector: "method",
            format: null, // ["camelCase", "UPPER_CASE", "PascalCase"],
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
        "require-jsdoc": "off",
        "no-console": "off",
        "@typescript-eslint/no-misused-promises": "off",
      },
    },
    {
      files: ["*.vue"],
      extends: ["plugin:@ota-meshi/+vue3", "plugin:@ota-meshi/+prettier"],
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        require: true,
      },
    },
    {
      files: ["docs/.vitepress/**"],
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        project: null,
      },
      globals: {
        window: true,
      },
      rules: {
        "require-jsdoc": "off",
      },
    },
  ],
};
