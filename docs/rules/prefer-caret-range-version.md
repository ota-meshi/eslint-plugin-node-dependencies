---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/prefer-caret-range-version"
description: "require caret(^) version instead of range version."
---
# node-dependencies/prefer-caret-range-version

> require caret(^) version instead of range version.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the use of the caret(`^`) ranges syntax.

```json5
{
  "dependencies": {
    /* ✓ GOOD */
    "a": "^1.0.0",

    /* ✗ BAD */
    "b": ">=1.0.0 <2.0.0",
    "c": ">=0.1.0 <0.2.0",
    "d": ">=0.0.1 <0.0.2",
    "e": "1.2.3 - 1",
    "f": "~1",
    "g": "~1.x"
  },
}
```

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/prefer-caret-range-version.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/prefer-caret-range-version.ts)
