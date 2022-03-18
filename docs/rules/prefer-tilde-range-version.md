---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/prefer-tilde-range-version"
description: "require tilde(`~`) version instead of range version."
since: "v0.8.0"
---
# node-dependencies/prefer-tilde-range-version

> require tilde(`~`) version instead of range version.

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the use of the tilde(`~`) ranges syntax.

<eslint-code-block fix file-name="package.json" :rules="{'node-dependencies/prefer-tilde-range-version': 'error'}">

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

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.8.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/prefer-tilde-range-version.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/prefer-tilde-range-version.ts)
