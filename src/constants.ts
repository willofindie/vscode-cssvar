import { CSSVarDeclarations } from "./main";

export const JS_IDS = [
  "typescript",
  "typescriptreact",
  "javascript",
  "javascriptreact",
] as const;
export const SUPPORTED_LANGUAGE_IDS = [
  "css",
  "scss",
  "sass",
  "less",
  ...JS_IDS,
] as const;
export type SupportedLanguageIds = typeof SUPPORTED_LANGUAGE_IDS[number];

export type SupportedExtensionNames =
  | "css"
  | "scss"
  | "sass"
  | "less"
  | "ts"
  | "tsx"
  | "jsx"
  | "js"
  | "typescript"
  | "typescriptreact"
  | "javascript"
  | "javascriptreact";

export interface Config {
  files: string[];
  extensions: SupportedExtensionNames[];
  themes: string[];
  excludeThemedVariables: boolean;
}

export const DEFAULT_CONFIG: Config = {
  files: ["index.css"],
  extensions: ["css", "scss", "sass", "less"],
  themes: [],
  excludeThemedVariables: false,
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
export const CACHE: {
  cssVars: CSSVarRecord;
  fileMetas: {
    [path: string]: {
      path: string;
      lastModified: number;
    };
  };
} = {
  cssVars: {},
  fileMetas: {},
};

// export const FILTER_REGEX = /[\s:](--|var)\(?[\w-]*/;
/**
 * For now I am not supporting `var` keyword,
 * as it will invalidate createCompletionItems
 * memoized function, on every call, as I need to
 * pass the range to properly make this extension work
 */
export const FILTER_REGEX = /([\t\s:"'(`]--[\w-]*)/;
export const SUFFIX = /[;'")]{1}/;

export const SUPPORTED_CSS_RULE_TYPES = ["rule", "decl"];

/**
 * This Constant defines the regex for CSS Variable
 * declaration, in the CSS files or it's AST representation.
 */
export const CSS_VAR_REGEX = /^[\s\t]*--/;
