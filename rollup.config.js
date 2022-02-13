import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import pkg from "./package.json";
import tsConfig from "./tsconfig.json";

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
        target: tsConfig.compilerOptions.target,
        define: {
          __VERSION__: JSON.stringify(pkg.version),
        },
      }),
    ],
  },
];
