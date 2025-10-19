---
pageClass: "rule-details"
sidebarDepth: 0
title: "node-dependencies/require-provenance-deps"
description: "Require provenance information for dependencies"
since: "v1.2.0"
---

# node-dependencies/require-provenance-deps

> Require provenance information for dependencies

## :book: Rule Details

This rule reports dependency entries whose allowed version range includes packages that don't publish provenance attestations on the npm registry. It checks `dependencies` and `peerDependencies` by default, and can optionally check `devDependencies`.

```jsonc
/* eslint "node-dependencies/require-provenance-deps": "error" */
{
  "dependencies": {
    "eslint": "^9.39.0" /* ✓ GOOD: All resolved versions provide provenance information. */
  }
}
```

```jsonc
/* eslint "node-dependencies/require-provenance-deps": "error" */
{
  "dependencies": {
    "eslint": "^9.0.0", /* ✓ BAD: Reports because versions <=9.38.0 lack provenance attestations. */
    "babel-eslint": "^10" /* ✗ BAD: Reports because versions 10.0.0 - 10.1.0 lack provenance attestations. */
  }
}
```

The rule fetches npm metadata to determine which published versions expose provenance data. If no metadata is available for the package/range, the dependency is ignored.

## :wrench: Options

```json
{
  "node-dependencies/require-provenance-deps": ["error", {
    "devDependencies": false,
    "allows": []
  }]
}
```

- `devDependencies` … When `true`, the rule also inspects `devDependencies`.
- `allows` … An array of package names to ignore, even if they don't publish provenance data.

### :bulb: Examples

```jsonc
/* eslint "node-dependencies/require-provenance-deps": ["error", {"devDependencies": true}] */
{
  "devDependencies": {
    "eslint": "^9.0.0" /* ✗ BAD: Reported once devDependencies are included. */
  }
}
```

```jsonc
/* eslint "node-dependencies/require-provenance-deps": ["error", {"allows": ["eslint"]}] */
{
  "dependencies": {
    "eslint": "^9.0.0" /* ✓ GOOD: Explicitly allowed via the allows option. */
  }
}
```

## :books: Further reading

- [npm Docs – Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Blog - Introducing npm Package Provenance](https://github.blog/2023-04-26-introducing-npm-package-provenance/)

## :rocket: Version

This rule was introduced in eslint-plugin-node-dependencies v1.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/rules/require-provenance-deps.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/tests/lib/rules/require-provenance-deps.ts)
