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
  "astro",
] as const;
export const SUPPORTED_LANGUAGE_IDS = [...CSS_IDS, ...JS_IDS] as const;
export type SupportedLanguageIds = typeof SUPPORTED_LANGUAGE_IDS[number];
export type CssExtensions = Exclude<
  typeof CSS_IDS[number],
  "vue" | "svelte" | "astro"
>;

export type SupportedExtensionNames =
  | "css"
  | "scss"
  | "sass"
  | "less"
  | "postcss"
  | "vue"
  | "svelte"
  | "astro"
  | "ts"
  | "tsx"
  | "jsx"
  | "js"
  | "typescript"
  | "typescriptreact"
  | "javascript"
  | "javascriptreact";

export type JsExtensions = Extract<
  SupportedExtensionNames,
  "js" | "jsx" | "ts" | "tsx"
>;

export type CSSVarLocation = {
  local: string;
  remote: string;
  isRemote: boolean;
};

export type LintingSeverity = "off" | "warn" | "error";

/**
 * Since the inmem config this project maintains is completely diffent than
 * what user-facing setting types are, it was necessary to separate these two
 * types into their own.
 */
export interface Config {
  files: CSSVarLocation[];
  // Ignore could be a glob as well.
  ignore: string[];
  enable: boolean;
  extensions: SupportedExtensionNames[];
  themes: string[];
  mode: [LintingSeverity, { ignore?: RegExp | null }];
  postcssPlugins: [string, Record<string, any>][];
  postcssSyntax: Record<string, string>;
  excludeThemedVariables: boolean;
  disableSort: boolean;
  enableColors: boolean;
  enableGotoDef: boolean;
  enableHover: boolean;
}

export type WorkspaceConfig = Omit<
  Config,
  "files" | "mode" | "postcssPlugins"
> & {
  files: string[];
  mode: LintingSeverity | [LintingSeverity, { ignore: string[] }];
  postcssPlugins: string[] | [string, Record<string, any>][];
};

/**
 * Remeber(shub):
 *  VSCode's default config settings should always point to null,
 *  because we are programatically overriding VSCode's behaviour.
 */
export const DEFAULT_CONFIG: WorkspaceConfig = {
  files: ["**/*.css"],
  ignore: ["**/node_modules/**"],
  enable: true,
  extensions: [...SUPPORTED_LANGUAGE_IDS],
  mode: "off",
  themes: [],
  postcssPlugins: [],
  postcssSyntax: {},
  excludeThemedVariables: false,
  disableSort: false,
  enableColors: true,
  enableGotoDef: true,
  enableHover: true,
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
  cssVars: { [activeRootpath: string]: CSSVarRecord };
  // Reverse map for easy access to CSS variable details
  cssVarsMap: {
    [activeRootpath: string]: { [varName: string]: CSSVarDeclarations };
  };
  // Keeps a map of each variable's file location
  cssVarDefinitionsMap: {
    [activeRootpath: string]: { [varName: string]: Location[] };
  };
  cssVarCount: { [activeRootpath: string]: number };
  // Following propety should always point to a local file path
  filesToWatch: { [activeRootpath: string]: Set<string> };
  fileMetas: {
    [path: string]: {
      path: string;
      lastModified: number;
    };
  };
  config: { [activeRootpath: string]: Config };
  activeRootPath: string;
  tmpDir: string;
};

export const CACHE: CacheType = {
  cssVars: {},
  cssVarsMap: {},
  cssVarDefinitionsMap: {},
  cssVarCount: {},
  filesToWatch: {},
  fileMetas: {},
  config: {}, // Points to active config.
  activeRootPath: "",
  tmpDir: "",
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

/**
 * Ref: https://www.w3.org/TR/css-color-4/#resolving-sRGB-values
 *
 * NOTE:
 *  - `number`: 23.45e2 === 2345, pattern \d*\.?\d+e?\d+
 *  - `percentage`: <number>%
 *  - `hue`: <number> or <number>deg|rad etc
 *  - `alpha`: can be `number` or `percentage`
 *
 * - rgb: rgba?(x y z [ / alpha])
 * - rgb (legacy): rgba?(x, y, z, alpha?])
 *  - where, x,y,z can be percentage or number. Number can look like: 23.45e2 === 2345
 *  - regex can look like: rgba?((.*?)[\s,]{1}(.*?)[\s,]{1}(.*?)([,/].*?)?)
 *
 * - hsl: hsla?(x y z [ / alpha])
 * - hsl(legacy): hsla?(x, y, z, alpha?)
 *  - where, x is hue which mean number ot deg. Deg as in <number>deg|rad etc.
 *  - where, y,z is percentage
 *
 * - lab: hsla?(x y z [ / alpha])
 *  - where, x is percentage. Percentage can look like 23.456%
 *  - where, y,z is percentage
 *
 * Do remember if:
 *  - separator is `\s` (space), divider will always be `/`
 *  - separator is `,` (comma), divider will always be `,` (comma)
 * applies vice-versa
 */
const cnn = /([+-]?\d*(\.\d+)?(e[+-]?\d+)?(%|deg|rad|grad|turn)?)/i.source; // color number notation
const vn = /(var\s*\(.*?\))/i.source; // var notation
const cORv = new RegExp(`(${vn}|${cnn})`, "i").source;
const cfn = /(rgba?|hsla?|hwb|lab|lch)/i.source; // color function notation
const csn = /\s*[,\s]{1}\s*/.source; // color separator notation
const cdn = /\s*([,/]){1}\s*/.source; // color divider notation
/**
 * required groups can be found at index position:
 * Function Name: [1]
 * First Value: [2]
 * Second Value: [8]
 * Third Value: [14]
 * Divider: [21]
 * Fourth Value: [22]
 *
 * Well I found that following is useful only for tracking actual function calls
 * with min 3 values at least. This regex won't be helpful for me to drill down
 * color functions which can have variable args using CSS variables, for e.g.:
 *  - hsl(var(--color))
 *  - hsl(var(--color) 50%)
 *  - hsl(var(--color) / 0.3)
 *
 * @deprecated
 */
export const CSS_COLOR_FUNCTION_PARSER = new RegExp(
  `^${cfn}\\s*\\(\\s*${cORv}${csn}${cORv}${csn}${cORv}(${cdn}${cORv})?\\s*\\)$`,
  "i"
);

/**
 * The only way to work around the above is to separately parse:
 *  - function name
 *  - function arguments
 *  - alpha divider or separator
 *
 * Following parser will provide all the arg present in the color function, in proper order
 */
export const CSS_COLOR_ARG_PARSER = new RegExp(`${cORv}`, "gi");
/**
 * Following can be used to test supported css color functions
 * It can also be used to fetch the function name
 */
export const CSS_COLOR_FUNCTION_NOTATION = new RegExp(
  `^(${cfn})\\s*\\(.*?\\)$`,
  "i"
);

export const SCSS_COLOR_INTERPOLATION = /^#{\s*?(\$\S+?)\s*}$/i;

export const CSS_VAR_FUNCTION_NOTATION = /^var\s*\((?<args>.*?)\)$/i;

export const PATTERN_ALL_VARIABLE_USAGES = /var\s*\((.*?)\)/g;

export const SUPPORTED_CSS_RULE_TYPES = ["rule", "decl", "atrule"] as const;
export const SUPPORTED_IMPORT_NAMES = new Set(["import", "use", "forward"]);

/**
 * Since CSS variables are global by nature, any variable defined in the
 * source files that get's imported in CSS files should be considered for
 * evaluation.
 */
export const SUPPORTED_EVALUATING_ATRULES = new Set([
  // css specific at-rules
  "media",
  // css at-rules which are new or rarely used.
  "page",
  "supports",
  "layer",
  // scss specific at-rules
  "mixin",
]);
