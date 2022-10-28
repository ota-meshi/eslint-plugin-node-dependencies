---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/absolute-version"
description: "require or disallow absolute version of dependency."
since: "v0.7.0"
---

# node-dependencies/absolute-version

> require or disallow absolute version of dependency.

## :book: Rule Details

This rule enforces the use of absolute version of dependency.

<eslint-code-block file-name="package.json" :rules="{'node-dependencies/absolute-version': 'error'}">

```json5
{
  "devDependencies": {
    "semver": "^7.3.5", /* ✗ BAD */
    "typescript": "4.6.2" /* ✓ GOOD */
  }
}
```

</eslint-code-block>

## :wrench: Options

### String Option

```json5
{
  "node-dependencies/absolute-version": ["error",
    "always" // or "never"
  ]
}
```

- `"always"` ... Enforces to use the absolute version.
- `"never"` ... Enforces not to use the absolute version.

### Object Option

```json5
{
  "node-dependencies/absolute-version": ["error", {
    "dependencies": "ignore", // , "always" or "never"
    "peerDependencies": "ignore", // , "always" or "never"
    "optionalDependencies": "ignore", // , "always" or "never"
    "devDependencies": "always" // , "never" or "ignore"
  }]
}
```

- `dependencies` ... Configuration for `dependencies`.
- `peerDependencies` ... Configuration for `dependencies`.
- `optionalDependencies` ... Configuration for `dependencies`.
- `devDependencies` ... Configuration for `dependencies`.
- Value
  - `"always"` ... Enforces to use the absolute version.
  - `"never"` ... Enforces not to use the absolute version.
  - `"ignore"` ... Ignored from the check.

By default, `always` applies only to `devDependencies`.

### Override Option for Each Package

```json5
{
  "node-dependencies/absolute-version": ["error", {
    // "dependencies": "ignore",
    // "peerDependencies": "ignore",
    // "optionalDependencies": "ignore",
    // "devDependencies": "always",
    "overridePackages": {
      "foo": "always" // Always use an absolute version for the "foo" package.
    }
  }]
}
```

- `overridePackages` ... Configure an object with the package name as the key.
  - Property Key ... Specify the package name, or the pattern such as `/^@babel\//`.
  - Property Value ... Can use the Object Option or the String Option.

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.7.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/absolute-version.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/absolute-version.ts)
