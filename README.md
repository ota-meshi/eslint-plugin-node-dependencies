# Introduction

[eslint-plugin-node-dependencies](https://www.npmjs.com/package/eslint-plugin-node-dependencies) is ESLint plugin to check Node.js dependencies.

::: This Plugin is still in an EXPERIMENTAL STATE :::

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-node-dependencies.svg)](https://www.npmjs.com/package/eslint-plugin-node-dependencies)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-node-dependencies.svg)](https://www.npmjs.com/package/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-node-dependencies&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-node-dependencies/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-node-dependencies/actions/workflows/NodeCI.yml?query=branch%3Amain)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-node-dependencies/badge.svg?branch=main)](https://coveralls.io/github/ota-meshi/eslint-plugin-node-dependencies?branch=main)

## :name_badge: Features

This ESLint plugin checks `package.json` and provides linting rules related to dependencies problems.

<!--DOCS_IGNORE_START-->

## :book: Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-node-dependencies/).

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-node-dependencies
```

> **Requirements**
>
> - ESLint v6.0.0 and above
> - Node.js v14.16.0 and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->

Add `node-dependencies` to the plugins section of your `eslint.config.js` or `.eslintrc` configuration file (you can omit the `eslint-plugin-` prefix)  
and either use one of the two configurations available (`recommended`) or configure the rules you want:

### The recommended configuration (New Config)

The `plugin.configs["flat/recommended"]` config enables a subset of [the rules](#white_check_mark-rules) that should be most useful to most users.
*See [lib/configs/rules/recommended.ts](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/configs/rules/recommended.ts) for more details.*

```js
// eslint.config.js
import * as nodeDependenciesPlugin from "eslint-plugin-node-dependencies"

export default [
    ...nodeDependenciesPlugin.configs["flat/recommended"],
];
```

### The recommended configuration (Legacy Config)

The `plugin:node-dependencies/recommended` config enables a subset of [the rules](#white_check_mark-rules) that should be most useful to most users.
*See [lib/configs/rules/recommended.ts](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/configs/rules/recommended.ts) for more details.*

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "node-dependencies"
    ],
    "extends": [
         // add more generic rulesets here, such as:
         // 'eslint:recommended',
        "plugin:node-dependencies/recommended"
    ]
}
```

### Advanced Configuration

Override/add specific rules configurations. *See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)*.

```js
// eslint.config.js
import * as nodeDependenciesPlugin from "eslint-plugin-node-dependencies"

export default [
    {
        plugins: { "node-dependencies": nodeDependenciesPlugin }
        rules: {
            // Override/add rules settings here, such as:
            "node-dependencies/rule-name": "error"
        }
    }
];
```

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "node-dependencies"
    ],
    "rules": {
        // Override/add rules settings here, such as:
        "node-dependencies/rule-name": "error"
    }
}
```

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.json`.

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
module.exports = {
  // ...
  extends: [ "plugin:node-dependencies/recommended"],
  // ...
  parser: "@babel/eslint-parser",
  // Add an `overrides` section to add a parser configuration for json.
  overrides: [
    {
      files: ["*.json", "*.json5"],
      parser: "jsonc-eslint-parser",
    },
  ],
  // ...
};
```

<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.
The rules with the following star :star: are included in the `plugin:node-dependencies/recommended` config.

<!--RULES_TABLE_START-->

### Possible Errors

| Rule ID | Description |    |
|:--------|:------------|:---|
| [node-dependencies/compat-engines](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/compat-engines.html) | enforce the versions of the engines of the dependencies to be compatible. | :star: |
| [node-dependencies/no-dupe-deps](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/no-dupe-deps.html) | disallow duplicate dependencies. | :star: |
| [node-dependencies/valid-semver](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/valid-semver.html) | enforce versions that is valid as a semantic version. | :star: |

### Best Practices

| Rule ID | Description |    |
|:--------|:------------|:---|
| [node-dependencies/absolute-version](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/absolute-version.html) | require or disallow absolute version of dependency. |  |
| [node-dependencies/no-deprecated](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/no-deprecated.html) | disallow having dependencies on deprecate packages. |  |
| [node-dependencies/no-restricted-deps](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/no-restricted-deps.html) | Disallows dependence on the specified package. |  |
| [node-dependencies/require-provenance-deps](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/require-provenance-deps.html) | Require provenance information for dependencies |  |

### Stylistic Issues

| Rule ID | Description |    |
|:--------|:------------|:---|
| [node-dependencies/prefer-caret-range-version](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/prefer-caret-range-version.html) | require caret(`^`) version instead of range version. | :wrench: |
| [node-dependencies/prefer-tilde-range-version](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/prefer-tilde-range-version.html) | require tilde(`~`) version instead of range version. | :wrench: |

### Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
| [node-dependencies/valid-engines](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/valid-engines.html) | [node-dependencies/compat-engines](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/compat-engines.html.md) |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

## :rocket: To Do More Verification

### Verify JSON

You can verify the JSON files by checking and installing [eslint-plugin-jsonc].

### Verify using JSON Schema

You can verify using JSON Schema by checking and installing [eslint-plugin-json-schema-validator].

<!-- ## :gear: Settings

See [Settings](https://ota-meshi.github.io/eslint-plugin-node-dependencies/settings/). -->

<!--DOCS_IGNORE_START-->

<!-- ## :traffic_light: Semantic Versioning Policy

**eslint-plugin-jsonc** follows [Semantic Versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy). -->

## :beers: Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run update` runs in order to update readme and recommended configuration.
- `npm run new [new rule name]` runs to create the files needed for the new rule.
- `npm run docs:watch` starts the website locally.

<!--DOCS_IGNORE_END-->

## :couple: Related Packages

- [eslint-plugin-jsonc](https://github.com/ota-meshi/eslint-plugin-jsonc) ... ESLint plugin for JSON, JSON with comments (JSONC) and JSON5.
- [eslint-plugin-json-schema-validator](https://github.com/ota-meshi/eslint-plugin-json-schema-validator) ... ESLint plugin that validates data using JSON Schema Validator.
- [jsonc-eslint-parser](https://github.com/ota-meshi/jsonc-eslint-parser) ... JSON, JSONC and JSON5 parser for use with ESLint plugins.

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[eslint-plugin-jsonc]: https://github.com/ota-meshi/eslint-plugin-jsonc
[eslint-plugin-json-schema-validator]: https://github.com/ota-meshi/eslint-plugin-json-schema-validator
