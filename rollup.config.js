import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import pkg from "./package.json";

export default [
  {
    input: "src/extension.ts",
    external: ["vscode"],
    output: {
      file: pkg.main,
      format: "cjs",
    },
    plugins: [
      resolve({
        browser: false,
        preferBuiltins: true,
      }),
      commonjs({
        ignoreGlobal: true,
      }),
      esbuild({
        minify: process.env.NODE_ENV === "production",
        sourceMap: process.env.NODE_ENV !== "production",
        target: "es6",
        define: {
          __VERSION__: JSON.stringify(pkg.version),
        },
      }),
    ],
  },
];
