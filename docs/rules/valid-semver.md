---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/valid-semver"
description: "enforce versions that is valid as a semantic version."
since: "v0.1.0"
---
# node-dependencies/valid-semver

> enforce versions that is valid as a semantic version.

- :gear: This rule is included in `"plugin:node-dependencies/recommended"`.

## :book: Rule Details

This rule checks the versions defined in package.json and reports if it is a valid semver.

```json
{
  "dependencies": {
    "semver": "^7.3.5 |" /* ✗ BAD */
  }
}
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/lib/rules/valid-semver.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/tests/lib/rules/valid-semver.ts)
