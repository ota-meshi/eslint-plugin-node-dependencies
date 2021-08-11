# Introduction

[eslint-plugin-node-dependencies](https://www.npmjs.com/package/eslint-plugin-node-dependencies) is ESLint plugin to check Node.js dependencies.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-node-dependencies.svg)](https://www.npmjs.com/package/eslint-plugin-node-dependencies)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-node-dependencies.svg)](https://www.npmjs.com/package/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-node-dependencies&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-node-dependencies.svg)](http://www.npmtrends.com/eslint-plugin-node-dependencies)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-node-dependencies/workflows/CI/badge.svg?branch=master)](https://github.com/ota-meshi/eslint-plugin-node-dependencies/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-node-dependencies/badge.svg?branch=master)](https://coveralls.io/github/ota-meshi/eslint-plugin-node-dependencies?branch=master)

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
> - Node.js v12.x, v14.x and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->

Add `node-dependencies` to the plugins section of your `.eslintrc` configuration file (you can omit the `eslint-plugin-` prefix)  
and either use one of the two configurations available (`recommended`) or configure the rules you want:

### The recommended configuration

The `plugin:node-dependencies/recommended` config enables a subset of [the rules](#white_check_mark-rules) that should be most useful to most users.
*See [lib/configs/recommended.ts](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/lib/configs/recommended.ts) for more details.*

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

<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.
The rules with the following star :star: are included in the `plugin:node-dependencies/recommended` config.

<!--RULES_TABLE_START-->

### Possible Errors

| Rule ID | Description |    |
|:--------|:------------|:---|
| [node-dependencies/valid-engines](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/valid-engines.html) | enforce the versions of the engines of the dependencies to be valid. | :star: |
| [node-dependencies/valid-semver](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/valid-semver.html) | enforce versions that is valid as a semantic version. | :star: |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

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

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
