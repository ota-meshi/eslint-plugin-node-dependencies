# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-node-dependencies
```

::: tip Requirements

- ESLint v6.0.0 and above
- Node.js v14.16.0 and above

:::

## :book: Usage

<!--USAGE_SECTION_START-->

Add `node-dependencies` to the plugins section of your `.eslintrc` configuration file (you can omit the `eslint-plugin-` prefix)  
and either use one of the two configurations available (`recommended`) or configure the rules you want:

### The recommended configuration

The `plugin:node-dependencies/recommended` config enables a subset of [the rules](../rules/README.md) that should be most useful to most users.
*See [lib/configs/recommended.ts](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/configs/recommended.ts) for more details.*

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "node-dependencies"
    ],
    "extends": [
         // add more generic rulesets here, such as:
         // 'eslint:recommended',
        "plugin:node-dependencies/recommended"
    ]
}
```

### Advanced Configuration

Override/add specific rules configurations. *See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)*.

```js
// .eslintrc.js
module.exports = {
    "plugins": [
        "node-dependencies"
    ],
    "rules": {
        // Override/add rules settings here, such as:
        "node-dependencies/rule-name": "error"
    }
}
```

#### Parser Configuration

If you have specified a parser, you need to configure a parser for `.json`.

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
module.exports = {
  // ...
  extends: [ "plugin:node-dependencies/recommended"],
  // ...
  parser: "@babel/eslint-parser",
  // Add an `overrides` section to add a parser configuration for json.
  overrides: [
    {
      files: ["*.json", "*.json5"],
      parser: "jsonc-eslint-parser",
    },
  ],
  // ...
};
```

<!--USAGE_SECTION_END-->

See [the rule list](../rules/README.md) to get the `rules` that this plugin provides.

<!-- Some rules also support [shared settings](../settings/README.md). -->
