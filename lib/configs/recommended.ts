export = {
    plugins: ["node-dependencies"],
    overrides: [
        {
            files: ["package.json"],
            parser: require.resolve("jsonc-eslint-parser"),
            rules: {
                // eslint-plugin-node-dependencies rules
                "node-dependencies/valid-engines": "error",
                "node-dependencies/valid-semver": "error",
            },
        },
    ],
}
