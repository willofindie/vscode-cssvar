import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import pkg from "./package.json" with { type: "json" };
import tsConfig from "./tsconfig.json" with { type: "json" };

const isProd = process.env.NODE_ENV === "production";

/**
 * @type {import("rollup").RollupOptions[]}
 */
export default [
  {
    input: "src/extension.ts",
    external: ["vscode"],
    output: {
      // file: pkg.main,
      dir: "out",
      format: "cjs",
    },
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || "development"
        ),
        preventAssignment: true,
      }),
      json(),
      resolve({
        browser: false,
        preferBuiltins: true,
      }),
      commonjs({
        ignoreGlobal: true,
      }),
      esbuild({
        minify: isProd,
        sourceMap: !isProd,
        target: tsConfig.compilerOptions.target,
        define: {
          __VERSION__: JSON.stringify(pkg.version),
        },
      }),
    ],
  },
];
