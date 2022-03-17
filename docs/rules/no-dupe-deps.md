---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/no-dupe-deps"
description: "disallow duplicate dependencies."
---
# node-dependencies/no-dupe-deps

> disallow duplicate dependencies.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>

## :book: Rule Details

This rule reports that there are duplicate dependencies on the various dependencies as error.

```json5
{
  "dependencies": {
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

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/no-dupe-deps.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/no-dupe-deps.ts)
