import nodeDependenciesPlugin from "../../../../dist/index.mjs"

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nodeDependenciesPlugin.configs["recommended"],
];

export default config;
