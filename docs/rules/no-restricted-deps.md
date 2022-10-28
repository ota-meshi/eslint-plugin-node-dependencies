---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/no-restricted-deps"
description: "Disallows dependence on the specified package."
since: "v0.8.0"
---

# node-dependencies/no-restricted-deps

> Disallows dependence on the specified package.

## :book: Rule Details

This rule disallows dependence on specified (that is, user-defined) package.

## :wrench: Options

This rule takes a list of strings, where each string is a package name:

```json
{
  "node-dependencies/no-restricted-deps": ["error", "foo", "bar"]
}
```

Alternatively, the rule also accepts objects, where the package name, an optional version, and an optional custom message are specified:

```json
{
  "node-dependencies/no-restricted-deps": ["error",
    {
      "package": "foo",
      "message": "Use 'foo-x' instead."
    },
    {
      "package": "bar",
      "version": "<2.0.0"
    },
    {
      "package": "faker",
      "version": "6.6.6"
    },
    {
      "package": "node-ipc",
      "version": "9.2.2 || ^10.1.1 || ^11.0.0"
    }
  ]
}
```

Object options can also be set to `deep` option. Specify `"local"` or `"server"`.

- `"local"` ... Find the `package.json` in your local `node_modules` to check the dependencies deeply.
- `"server"` ... Above plus, use the `npm` command to check the dependencies deeply. **Note that this can be very time consuming**.

### Examples for strings

```json
{
  "node-dependencies/no-restricted-deps": ["error", "foo", "bar"]
}
```

```json5
{
  "devDependencies": {
    /* ✗ BAD */
    "foo": "^1.0.0",
    "bar": "^2.0.0",

    /* ✓ GOOD */
    "baz": "^1.0.0",
    "qux": "^1.0.0"
  }
}
```

### Examples for objects

```json
{
  "node-dependencies/no-restricted-deps": ["error",
    {
      "package": "foo",
      "message": "Use 'foo-x' instead."
    },
    {
      "package": "bar",
      "version": "<2.0.0"
    }
  ]
}
```

```json5
{
  "devDependencies": {
    /* ✗ BAD */
    "foo": "^1.0.0", // Reported. "Use 'foo-x' instead."

    /* ✓ GOOD */
    "bar": "^2.0.0", // This is fine as it does not intersect with '<2.0.0'.
  }
}
```

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v0.8.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/no-restricted-deps.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/no-restricted-deps.ts)
