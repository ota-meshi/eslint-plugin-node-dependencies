import { RuleTester } from "../utils/compat-eslint";
import rule from "../../../lib/rules/valid-semver";
import * as jsoncParser from "jsonc-eslint-parser";
const tester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run("valid-semver", rule as any, {
  valid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "foo": "1.0.0 - 2.9999.9999",
                    "bar": ">=1.0.2 <2.1.2",
                    "baz": ">1.0.2 <=2.3.4",
                    "boo": "2.0.1",
                    "qux": "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0",
                    "asd": "http://asdf.com/asdf.tar.gz",
                    "til": "~1.2",
                    "elf": "~1.2.3",
                    "two": "2.x",
                    "thr": "3.3.x",
                    "lat": "latest",
                    "dyl": "file:../dyl"
                }
            }
            `,
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "express": "expressjs/express",
                    "mocha": "mochajs/mocha#4727d357ea",
                    "module": "user/repo#feature/branch",
                    "bar": "file:../foo/bar"
                }
            }
            `,
    },
    {
      // https://github.com/fkling/astexplorer/blob/master/website/package.json
      filename: "package.json",
      code: `
            {
                "name": "astexplorer",
                "version": "2.0.0",
                "description": "Online demo of various parsers",
                "private": true,
                "repository": {
                  "type": "git",
                  "url": "https://github.com/fkling/esprima_ast_explorer.git"
                },
                "author": "Felix Kling",
                "devDependencies": {
                  "@babel/core": "~7.12.0",
                  "@babel/plugin-transform-runtime": "^7.12.0",
                  "@babel/preset-env": "^7.12.0",
                  "@babel/preset-react": "^7.12.0",
                  "autoprefixer": "^9.7.6",
                  "babel-loader": "^8.0.4",
                  "cross-env": "^7.0.2",
                  "css-loader": "^3.5.2",
                  "eslint": "^6.6.0",
                  "eslint-import-resolver-webpack": "^0.12.1",
                  "eslint-plugin-import": "^2.2.0",
                  "eslint-plugin-react": "^7.0.1",
                  "eslint-plugin-require-in-package": "^1.0.3",
                  "exports-loader": "^0.7.0",
                  "file-loader": "^6.0.0",
                  "html-webpack-plugin": "^3.2.0",
                  "inline-manifest-webpack-plugin": "^4.0.1",
                  "js-yaml": "^3.13.1",
                  "json-loader": "^0.5.3",
                  "mini-css-extract-plugin": "^0.9.0",
                  "null-loader": "^4.0.0",
                  "postcss-loader": "^3.0.0",
                  "raw-loader": "^4.0.0",
                  "rimraf": "^3.0.2",
                  "serve": "^11",
                  "style-loader": "^1.1.3",
                  "terser-webpack-plugin": "^2.2.1",
                  "url-loader": "^4.1.0",
                  "webpack": "^4.17.2",
                  "webpack-cli": "^3.1.0"
                },
                "dependencies": {
                  "@angular-eslint/template-parser": "^1.0.0",
                  "@angular/compiler": "^11.2.0",
                  "@babel/eslint-parser": "^7.12.0",
                  "@babel/runtime": "^7.12.0",
                  "@creditkarma/thrift-parser": "^1.2.0",
                  "@gengjiawen/monkey-wasm": "^0.5.0",
                  "@glimmer/compiler": "^0.73.1",
                  "@glimmer/syntax": "^0.73.1",
                  "@humanwhocodes/momoa": "^1.0.0",
                  "@mdx-js/mdx": "^1.5.8",
                  "@typescript-eslint/parser": "^4.1.0",
                  "@vue/compiler-dom": "^3.0.0-rc.10",
                  "@webassemblyjs/wast-parser": "^1.9.0",
                  "acorn": "^8.3.0",
                  "acorn-jsx": "^5.3.1",
                  "acorn-loose": "^8.1.0",
                  "acorn-to-esprima": "^2.0.8",
                  "astexplorer-go": "^1.0.0",
                  "astexplorer-refmt": "^1.0.1",
                  "astexplorer-syn": "^1.0.48",
                  "babel-core": "^6.24.0",
                  "babel-eslint": "^7.2.3",
                  "babel-eslint8": "npm:babel-eslint@^8",
                  "babel-eslint9": "npm:babel-eslint@^9",
                  "babel-plugin-macros": "^2.8.0",
                  "babel-plugin-transform-flow-strip-types": "^6.22.0",
                  "babel-preset-es2015": "^6.24.1",
                  "babel-preset-stage-0": "^6.24.1",
                  "babel5": "npm:babel-core@^5",
                  "babel6": "npm:babel-core@^6",
                  "babel7": "npm:@babel/core@^7",
                  "babylon5": "npm:babylon@^5",
                  "babylon6": "npm:babylon@^6",
                  "babylon7": "npm:@babel/parser@^7",
                  "cherow": "^1.6.8",
                  "codemirror": "^5.22.0",
                  "codemirror-graphql": "^0.11.6",
                  "css": "^2.2.1",
                  "css-tree": "^1.0.0",
                  "cssom": "^0.4.4",
                  "domhandler": "^4.0.0",
                  "ember-template-recast": "^5.0.1",
                  "escodegen": "^1.14.1",
                  "esformatter-parser": "^1.0.0",
                  "eslint1": "npm:eslint@^1",
                  "eslint2": "npm:eslint@^2",
                  "eslint3": "npm:eslint@^3",
                  "eslint4": "npm:eslint@^4",
                  "espree": "^6.2.1",
                  "esprima": "^4.0.1",
                  "filbert": "^0.1.20",
                  "flow-parser": "^0.144.0",
                  "font-awesome": "^4.5.0",
                  "glsl-parser": "^2.0.0",
                  "glsl-tokenizer": "^2.1.2",
                  "graphql": "^15.0.0",
                  "halting-problem": "^1.0.2",
                  "handlebars": "^4.7.6",
                  "hermes-parser": "^0.4.7",
                  "htmlparser2": "^5.0.1",
                  "hyntax": "^1.1.5",
                  "intl-messageformat-parser": "^6.1.0",
                  "isomorphic-fetch": "^2.2.1",
                  "java-parser": "^0.6.0",
                  "jscodeshift": "^0.11.0",
                  "json-stringify-safe": "^5.0.1",
                  "json-to-ast": "^2.1.0",
                  "lodash.isequal": "^4.5.0",
                  "luaparse": "^0.3.0",
                  "lucene": "^2.1.1",
                  "meriyah": "^1.9.12",
                  "parse5": "^6.0.0",
                  "parse5-htmlparser2-tree-adapter": "^6.0.0",
                  "php-parser": "^3.0.0",
                  "postcss": "^7.0.27",
                  "postcss-less": "^3.1.2",
                  "postcss-safe-parser": "^4.0.2",
                  "postcss-scss": "^2.0.0",
                  "posthtml": "^0.13.4",
                  "posthtml-parser": "^0.5.1",
                  "prettier": "^2.0.4",
                  "prop-types": "^15.5.10",
                  "pug-lexer": "^4.1.0",
                  "pug-parser": "^5.0.1",
                  "react": "16",
                  "react-dom": "^16.0.1",
                  "react-redux": "^7.2.0",
                  "recast": "^0.20.3",
                  "redot": "^0.6.0",
                  "redux": "^4.0.5",
                  "regexp-tree": "^0.1.5",
                  "regexpp": "^3.1.0",
                  "regjsparser": "^0.6.0",
                  "remark": "^13.0.0",
                  "remark-directive": "^1.0.0",
                  "remark-frontmatter": "^3.0.0",
                  "remark-gfm": "^1.0.0",
                  "remark-math": "^4.0.0",
                  "san": "^3.9.4",
                  "scalameta-parsers": "^4.4.17",
                  "seafox": "^1.6.9",
                  "shift-parser": "^7.0.0",
                  "solidity-parser-antlr": "^0.4.0",
                  "solidity-parser-diligence": "^0.4.18",
                  "source-map": "^0.6.1",
                  "sqlite-parser": "^1.0.0-rc3",
                  "svelte": "^3.4.1",
                  "tenko": "^1.0.6",
                  "tern": "^0.24.3",
                  "traceur": "0.0.111",
                  "tslint": "^6.1.1",
                  "typescript": "^4.0.3",
                  "typescript-eslint-parser": "^22.0.0",
                  "uglify-es": "^3.0.28",
                  "unist-util-is": "^4.0.3",
                  "unist-util-visit": "^2.0.3",
                  "unist-util-visit-parents": "^3.1.1",
                  "vue-eslint-parser": "^7.6.0",
                  "vue-template-compiler": "^2.6.9",
                  "webidl2": "^23.5.1",
                  "worker-loader": "^2.0.0",
                  "yaml": "^1.7.2",
                  "yaml-ast-parser": "^0.0.43"
                },
                "browserslist": "> 0.25%, not dead",
                "scripts": {
                  "start": "serve -l 8080 ../out",
                  "build": "rimraf ../out/* && cross-env NODE_ENV=production webpack --mode=production",
                  "build-dev": "rimraf ../out/* && cross-env NODE_ENV=development webpack -d --mode=development",
                  "watch": "webpack -dw --mode=development",
                  "lint": "node_modules/eslint/bin/eslint.js src/",
                  "fontcustom": "fontcustom compile ./fontcustom/input-svg/ --config=./fontcustom/config.yml"
                }
              }`,
    },
    {
      // Local paths
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "a": "../foo/bar",
                    "b": "~/foo/bar",
                    "c": "./foo/bar",
                    "d": "/foo/bar",
                    "e": "."
                }
            }`,
    },
  ],
  invalid: [
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "foo": "|"
                }
            }
            `,
      errors: [
        {
          message: '"|" is invalid.',
          line: 4,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "semver": "^7.3.5 |"
                }
            }
            `,
      errors: [
        {
          message: '"^7.3.5 |" is invalid.',
          line: 4,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": "^12 |"
                }
            }
            `,
      errors: [
        {
          message: '"^12 |" is invalid.',
          line: 4,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "dependencies": {
                    "semver": 7
                }
            }
            `,
      errors: [
        {
          message: "`7` is invalid.",
          line: 4,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "engines": {
                    "node": 12
                }
            }
            `,
      errors: [
        {
          message: "`12` is invalid.",
          line: 4,
        },
      ],
    },
    {
      filename: "package.json",
      code: `
            {
                "devDependencies": {
                    "semver": "^7.3.5 |"
                },
                "peerDependencies": {
                    "semver": "^7.3.5 |"
                },
                "optionalDependencies": {
                    "semver": "^7.3.5 |"
                }
            }
            `,
      errors: [
        {
          message: '"^7.3.5 |" is invalid.',
          line: 4,
        },
        {
          message: '"^7.3.5 |" is invalid.',
          line: 7,
        },
        {
          message: '"^7.3.5 |" is invalid.',
          line: 10,
        },
      ],
    },
  ],
});
