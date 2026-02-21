import type { DefaultTheme, UserConfig } from "vitepress";
import { defineConfig } from "vitepress";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createTwoslasher as createTwoslasherESLint } from "twoslash-eslint";
import * as jsoncParser from "jsonc-eslint-parser";
import {
  activeRuleNames,
  deprecatedRuleNames,
} from "../../lib/utils/rule-names.ts";
const dirname = path.dirname(fileURLToPath(import.meta.url));

function ruleToSidebarItem(ruleName: string): DefaultTheme.SidebarItem {
  return {
    text: `node-dependencies/${ruleName}`,
    link: `/rules/${ruleName}`,
  };
}

export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const pluginPath = path.join(dirname, "../../dist/index.mjs");
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
                files: ["*", "**/*", "**/*.*"],
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
            items: activeRuleNames.map(ruleToSidebarItem),
          },

          // Rules in no category.
          ...(deprecatedRuleNames.length > 0
            ? [
                {
                  text: "Deprecated",
                  collapsed: false,
                  items: deprecatedRuleNames.map(ruleToSidebarItem),
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
