// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
// @ts-ignore -- Backwards compatibility
export = {
  plugins: ["node-dependencies"],
  overrides: [
    {
      files: ["package.json"],
      parser: require.resolve("jsonc-eslint-parser"),
      rules: {
        // eslint-plugin-node-dependencies rules
        "node-dependencies/compat-engines": "error",
        "node-dependencies/no-dupe-deps": "error",
        "node-dependencies/valid-semver": "error",
      },
    },
  ],
};
