"use strict"

module.exports = {
    root: true,
    extends: [
        // add more generic rulesets here, such as:
        // 'eslint:recommended',
        "plugin:node-dependencies/recommended",
    ],
    rules: {
        // override/add rules settings here, such as:
        // 'node-dependencies/rule-name': 'error'
    },
}
