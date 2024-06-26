---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/no-deprecated"
description: "disallow having dependencies on deprecate packages."
since: "v0.2.0"
---

# node-dependencies/no-deprecated

> disallow having dependencies on deprecate packages.

## :book: Rule Details

This rule disallows having dependencies on deprecate packages.

```jsonc
/* eslint "node-dependencies/no-deprecated": "error" */
{
  "dependencies": {
    "@babel/eslint-parser": "^7.0.0", /* ✓ GOOD */
    "babel-eslint": "^10.0.0" /* ✗ BAD: babel-eslint is now @babel/eslint-parser. This package will no longer receive updates. */
  }
}
```

## :wrench: Options

```json
{
  "node-dependencies/no-deprecated": ["error", {
    "devDependencies": false
  }]
}
```

- `devDependencies` ... If `true`, the rule also checks `devDependencies`.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/no-deprecated.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/no-deprecated.ts)
