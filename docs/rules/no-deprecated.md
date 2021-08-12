---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/no-deprecated"
description: "disallow having dependencies on deprecate packages."
---
# node-dependencies/no-deprecated

> disallow having dependencies on deprecate packages.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>

## :book: Rule Details

This rule disallows having dependencies on deprecate packages.

```json5
{
  "devDependencies": {
    "@babel/eslint-parser": "^7.0.0", /* ✓ GOOD */
    "babel-eslint": "^10.0.0" /* ✗ BAD: babel-eslint is now @babel/eslint-parser. This package will no longer receive updates. */
  }
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/lib/rules/no-deprecated.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/master/tests/lib/rules/no-deprecated.ts)
