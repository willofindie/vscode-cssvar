import { Location } from "vscode";
import { CSSVarDeclarations } from "./main";

export const JS_IDS = [
  "typescript",
  "typescriptreact",
  "javascript",
  "javascriptreact",
] as const;
export const CSS_IDS = [
  "css",
  "scss",
  "sass",
  "less",
  "postcss",
  "vue",
  "svelte",
] as const;
export const SUPPORTED_LANGUAGE_IDS = [...CSS_IDS, ...JS_IDS] as const;
export type SupportedLanguageIds = typeof SUPPORTED_LANGUAGE_IDS[number];
export type CssExtensions = Exclude<
  typeof CSS_IDS[number],
  "vue" | "svelte" | "postcss" | "css"
>;

export type SupportedExtensionNames =
  | "css"
  | "scss"
  | "sass"
  | "less"
  | "postcss"
  | "vue"
  | "svelte"
  | "ts"
  | "tsx"
  | "jsx"
  | "js"
  | "typescript"
  | "typescriptreact"
  | "javascript"
  | "javascriptreact";

export interface Config {
  files: string[] | Record<string, string[]>;
  extensions: SupportedExtensionNames[];
  themes: string[];
  postcssPlugins: string[];
  postcssSyntax: string[];
  excludeThemedVariables: boolean;
  disableSort: boolean;
  enableColors: boolean;
  enableGotoDef: boolean;
}

export const DEFAULT_CONFIG: Config = {
  files: ["index.css"],
  extensions: [...CSS_IDS],
  themes: [],
  postcssPlugins: [],
  postcssSyntax: [],
  excludeThemedVariables: false,
  disableSort: false,
  enableColors: false,
  enableGotoDef: false,
};

export const mapShortToFullExtension = (
  ext: SupportedExtensionNames
): SupportedLanguageIds => {
  switch (ext) {
    case "ts":
      return "typescript";
    case "tsx":
      return "typescriptreact";
    case "js":
      return "javascript";
    case "jsx":
      return "javascriptreact";
    default:
      return ext;
  }
};

export const EXTENSION_NAME = "cssvar";
export type EXTENSION_PROPERTIES = keyof Config;
export const VAR_KEYWORD_REVERSE = ["(", "r", "a", "v"];

export type CSSVarRecord = { [path: string]: CSSVarDeclarations[] };
export type CacheType = {
  cssVars: CSSVarRecord;
  cssVarsMap: { [varName: string]: CSSVarDeclarations };
  cssVarDefinitionsMap: { [varName: string]: Location[] };
  filesToWatch: Set<string>;
  fileMetas: {
    [path: string]: {
      path: string;
      lastModified: number;
    };
  };
  config: Config;
};
export const CACHE: CacheType = {
  cssVars: {},
  cssVarsMap: {},
  cssVarDefinitionsMap: {},
  filesToWatch: new Set(),
  fileMetas: {},
  config: {} as Config,
};

export const POSTCSS_SYNTAX_MODULES: Record<CssExtensions, string> = {
  scss: "postcss-scss",
  sass: "postcss-sass",
  less: "postcss-less",
};

/**
 * Following Regexps are used for registering Intellisense
 * activation. Since CSS-in-JS and Plain CSS have completely different
 * syntax, having two different Regex to enable trigger the intellisense
 * is required. In CSS VSCode itself has some background CSS intellisense
 * present, to override that, we need to trigger our extension with first
 * `-` keypress, while for JS, since `-` is an operator, we enable our extension
 * only when user presses two consecutive `--`.
 */
export const JSS_REGEX_INITIATOR = /(--[\w-]*)/g;
/**
 * For the following I need to test for space initially, because
 * function names in CSS can have `-` for long names.
 * Space/Tab make sure `--` started fresh and is not part of a function name
 */
export const CSS_REGEX_INITIATOR = /[\t\s(:]{1}(-{1,2}[\w-]*)/g;
/**
 * Regex used to detect whether the string to be tested has one of the suffix
 * This mainly will be used to check whether or not we want to put a terminator at the
 * end of the var, if already not present.
 */
export const SUFFIX = /[;'")]{1}/;

export const SUPPORTED_CSS_RULE_TYPES = ["rule", "decl", "atrule"] as const;
export const SUPPORTED_IMPORT_NAMES = ["import", "use"];
