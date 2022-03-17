---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/prefer-tilde-range-version"
description: "require tilde(`~`) version instead of range version."
---
# node-dependencies/prefer-tilde-range-version

> require tilde(`~`) version instead of range version.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the use of the tilde(`~`) ranges syntax.

```json5
{
  "dependencies": {
    /* ✓ GOOD */
    "a": "~1.0.0",

    /* ✗ BAD */
    "b": ">=1.0.0 <1.1.0",
    "c": ">=0.1.0 <0.2.0",
    "e": "1.2.3 - 1.2"
  },
}
```

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/prefer-tilde-range-version.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/prefer-tilde-range-version.ts)