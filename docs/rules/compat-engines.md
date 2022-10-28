---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/compat-engines"
description: "enforce the versions of the engines of the dependencies to be compatible."
since: "v0.5.0"
---

# node-dependencies/compat-engines

> enforce the versions of the engines of the dependencies to be compatible.

- :gear: This rule is included in `"plugin:node-dependencies/recommended"`.

## :book: Rule Details

This rule checks the `engines` of the dependencies and reports if they are compatible with the `engines` defined in package.json.

```json5
{
  "engines": {
    "node": ">=8"
  },
  "dependencies": {
    "semver": "^7.3.5" /* ✗ BAD: node>=10 is required. */
  }
}
```

## :wrench: Options

```json
{
  "node-dependencies/compat-engines": ["error", {
    "deep": true,
    "comparisonType": "normal"
  }]
}
```

- `deep` ... If `true`, if the dependency does not have `engines`, it will be checked further dependencies.
- `comparisonType` ... Defines the comparison method. Default is `"normal"`
  - `"normal"` ... This is the normal comparison method.
  - `"major"` ... If the versions match in the major version, it is considered a match. For example, `node@>=10` allows dependency modules for `node@>=10.12`.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.5.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/compat-engines.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/compat-engines.ts)
