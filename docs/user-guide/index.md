# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-node-dependencies
```

::: tip Requirements

- ESLint v9.38.0 and above
- Node.js `^20.19.0 || ^22.13.0 || >=24`

:::

## :book: Usage

<!--USAGE_SECTION_START-->

Add `node-dependencies` to the plugins section of your `eslint.config.js` configuration file and either use one of the configurations available (`recommended`) or configure the rules you want:

### The recommended configuration

The `plugin.configs.recommended` config enables a subset of [the rules](../rules/index.md) that should be most useful to most users.
*See [lib/configs/rules/recommended.ts](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/main/lib/configs/rules/recommended.ts) for more details.*

```js
// eslint.config.js
import nodeDependenciesPlugin from "eslint-plugin-node-dependencies"

export default [
    ...nodeDependenciesPlugin.configs.recommended,
];
```

### Advanced Configuration

Override/add specific rules configurations. *See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring)*.

```js
// eslint.config.js
import nodeDependenciesPlugin from "eslint-plugin-node-dependencies"

export default [
    {
        plugins: { "node-dependencies": nodeDependenciesPlugin },
        rules: {
            // Override/add rules settings here, such as:
            "node-dependencies/rule-name": "error"
        }
    }
];
```

<!--USAGE_SECTION_END-->

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

<!-- Some rules also support [shared settings](../settings/README.md). -->
