import recommendedRules from "./rules/recommended";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
// @ts-ignore -- Backwards compatibility
export = {
  plugins: ["node-dependencies"],
  overrides: [
    {
      files: ["package.json"],
      parser: require.resolve("jsonc-eslint-parser"),
      rules: recommendedRules.rules,
    },
  ],
};
