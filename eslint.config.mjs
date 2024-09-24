// @ts-check
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierLintRecommended from "eslint-plugin-prettier/recommended";
import jest from "eslint-plugin-jest";

/**
 * @typedef {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config["rules"]} ESLintRules
 * @typedef {import('@typescript-eslint/utils').TSESLint.FlatConfig.Config["languageOptions"]} LanguageOptions
 */

/** @type {ESLintRules} */
const BASE_RULES = {
  "@typescript-eslint/camelcase": 0,
  "@typescript-eslint/explicit-function-return-type": 0,
  "@typescript-eslint/explicit-module-boundary-types": 0,
  "@typescript-eslint/no-explicit-any": 0,
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  "@typescript-eslint/no-var-requires": 0,
  "@typescript-eslint/ban-ts-comment": 1,
  "prettier/prettier": "error",
  "no-console": "error",
};

/** @type {LanguageOptions} */
const BASE_LANGUAGE_OPTIONS = {
  ecmaVersion: 2022,
  sourceType: "module",
  globals: {
    ...globals.browser,
    ...globals.node,
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  prettierLintRecommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    ignores: ["out/", "src/test/", "src/scripts/"],
    languageOptions: {
      ...BASE_LANGUAGE_OPTIONS,
    },
    rules: BASE_RULES,
  },
  {
    files: ["src/test/**/*.ts"],
    ignores: ["out/", "src/scripts/"],
    ...jest.configs["flat/recommended"],
    languageOptions: {
      ...BASE_LANGUAGE_OPTIONS,
    },
    rules: {
      ...jest.configs["flat/recommended"].rules,
      ...BASE_RULES,
    },
  }
);
