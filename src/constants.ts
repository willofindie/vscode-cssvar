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
  excludeThemedVariables: boolean;
  disableSort: boolean;
  enableColors: boolean;
  enableGotoDef: boolean;
}

export const DEFAULT_CONFIG: Config = {
  files: ["index.css"],
  extensions: [...CSS_IDS],
  themes: [],
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

export const CSS3Colors = [
  "black",
  "silver",
  "gray",
  "white",
  "maroon",
  "red",
  "purple",
  "fuchsia",
  "green",
  "lime",
  "olive",
  "yellow",
  "navy",
  "blue",
  "teal",
  "aqua",
  "orange",
  "aliceblue",
  "antiquewhite",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "blanchedalmond",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "aqua",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "limegreen",
  "linen",
  "magenta",
  "fuchsia",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "oldlace",
  "olivedrab",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "whitesmoke",
  "yellowgreen",
];

export type CSSVarRecord = { [path: string]: CSSVarDeclarations[] };
export type CacheType = {
  cssVars: CSSVarRecord;
  cssVarsMap: { [varName: string]: CSSVarDeclarations };
  cssVarDefinitionsMap: { [varName: string]: Location[] };
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
  fileMetas: {},
  config: {} as Config,
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
 * This Constant defines the regex for CSS Variable
 * declaration, in the CSS files or it's AST representation.
 * DO NOT CHANGE as it is used only in one place to parse CSS AST
 * declaration
 */
export const CSS_VAR_REGEX = /^[\s\t]*--/;

export const SUPPORTED_CSS_RULE_TYPES = ["rule", "decl"];
