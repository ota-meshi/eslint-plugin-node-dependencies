---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/valid-engines"
description: "enforce the versions of the engines of the dependencies to be compatible."
since: "v0.1.0"
---
# node-dependencies/valid-engines

> enforce the versions of the engines of the dependencies to be compatible.

- :gear: This rule is included in `"plugin:node-dependencies/recommended"`.

## :book: Rule Details

This rule checks the `engines` of the dependencies and reports if they are compatible with the `engines` defined in package.json.

```json
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
  "node-dependencies/valid-engines": ["error", {
    "deep": true
  }]
}
```

- `deep` ... If `true`, if the dependency does not have `engines`, it will be checked further dependencies.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/lib/rules/valid-engines.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/tests/lib/rules/valid-engines.ts)
