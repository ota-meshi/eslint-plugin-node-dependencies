import type { DefaultTheme, UserConfig } from "vitepress";
import { defineConfig } from "vitepress";
import path from "path";
import { fileURLToPath } from "url";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createTwoslasher as createTwoslasherESLint } from "twoslash-eslint";
import jsoncParser from "jsonc-eslint-parser";
import { rules } from "../../lib/utils/rules.js";

type RuleModule = {
  meta: { docs: { ruleId: string; ruleName: string }; deprecated?: boolean };
};

const dirname = path.dirname(fileURLToPath(import.meta.url));

function ruleToSidebarItem({
  meta: {
    docs: { ruleId, ruleName },
  },
}: RuleModule): DefaultTheme.SidebarItem {
  return {
    text: ruleId,
    link: `/rules/${ruleName}`,
  };
}

export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const pluginPath = path.join(dirname, "../../dist/index.js");
  const plugin = await import(pluginPath).then((m) => m.default || m);
  return defineConfig({
    base: "/eslint-plugin-node-dependencies/",
    title: "eslint-plugin-node-dependencies",
    outDir: path.join(dirname, "./dist/eslint-plugin-node-dependencies"),
    description: "ESLint plugin to check Node.js dependencies",
    head: [],
    lastUpdated: true,
    markdown: {
      codeTransformers: [
        transformerTwoslash({
          explicitTrigger: false, // Required for v-menu to work.
          langs: ["json", "jsonc", "json5"],
          filter(lang, code) {
            if (lang.startsWith("json")) {
              return code.includes("eslint");
            }
            return false;
          },
          errorRendering: "hover",
          twoslasher: createTwoslasherESLint({
            eslintConfig: [
              {
                files: ["*", "**/*"],
                plugins: {
                  "node-dependencies": plugin,
                },
                languageOptions: {
                  parser: jsoncParser,
                },
              },
            ],
          }),
        }),
      ],
    },
    themeConfig: {
      siteTitle: "eslint-plugin-\nnode-dependencies",
      search: {
        provider: "local",
        options: {
          detailedView: true,
        },
      },
      editLink: {
        pattern:
          "https://github.com/ota-meshi/eslint-plugin-node-dependencies/edit/main/docs/:path",
      },
      nav: [
        { text: "Introduction", link: "/" },
        { text: "User Guide", link: "/user-guide/" },
        { text: "Rules", link: "/rules/" },
      ],
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/ota-meshi/eslint-plugin-node-dependencies",
        },
      ],
      sidebar: {
        "/rules/": [
          {
            text: "Rules",
            items: [{ text: "Available Rules", link: "/rules/" }],
          },
          {
            text: "Node.js Dependency Rules",
            collapsed: false,
            items: rules
              .filter((rule) => !rule.meta.deprecated)
              .map(ruleToSidebarItem),
          },

          // Rules in no category.
          ...(rules.some((rule) => rule.meta.deprecated)
            ? [
                {
                  text: "Deprecated",
                  collapsed: false,
                  items: rules
                    .filter((rule) => rule.meta.deprecated)
                    .map(ruleToSidebarItem),
                },
              ]
            : []),
        ],
        "/": [
          {
            text: "Guide",
            items: [
              { text: "Introduction", link: "/" },
              { text: "User Guide", link: "/user-guide/" },
              { text: "Rules", link: "/rules/" },
            ],
          },
        ],
      },
    },
  });
};
