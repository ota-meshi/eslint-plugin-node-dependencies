---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/no-dupe-deps"
description: "disallow duplicate dependencies."
since: "v0.8.0"
---

# node-dependencies/no-dupe-deps

> disallow duplicate dependencies.

- :gear: This rule is included in `"plugin:node-dependencies/recommended"`.

## :book: Rule Details

This rule reports that there are duplicate dependencies on the various dependencies as error.

```jsonc
/* eslint "node-dependencies/no-dupe-deps": "error" */
{
  "dependencies": {
    /* ✗ BAD */
    "foo": "^1.0.0"
  },
  "devDependencies": {
    /* ✗ BAD */
    "foo": "^1.0.0",
    
    /* ✓ GOOD */
    "bar": "^1.0.0"
  }
}
```

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.8.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/no-dupe-deps.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/no-dupe-deps.ts)
