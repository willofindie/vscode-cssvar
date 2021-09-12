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

export const UNSTABLE_FEATURES = {
  no_sort: false,
};
export type UnstableFeatures = (keyof typeof UNSTABLE_FEATURES)[];

export interface Config {
  files: string[] | Record<string, string[]>;
  extensions: SupportedExtensionNames[];
  themes: string[];
  excludeThemedVariables: boolean;
  unstable: UnstableFeatures;
}

export const DEFAULT_CONFIG: Config = {
  files: ["index.css"],
  extensions: ["css", "scss", "sass", "less"],
  themes: [],
  excludeThemedVariables: false,
  unstable: [],
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

/**
 * Following regex supports:
 *  - CSS variables as values: `: --red` or `:--red`
 *  - CSS variables with `var(--`
 *  - CSS variables in CSS-in-JS, as strings/string literals
 *
 * Adds support for the following but changes are pending to support is properly.
 *  - Multiple use of CSS variables separated with commas: `linear-gradient(4deg, --var1, --var2)
 */
export const FILTER_REGEX = /((:(\t|\s)*)|(("|'|`)(\t|\s)*)|(\((\t|\s)*)|(,(\t|\s)*))(?<var>--[\w-]*)/;
export const SUFFIX = /[;'")]{1}/;

export const SUPPORTED_CSS_RULE_TYPES = ["rule", "decl"];

/**
 * This Constant defines the regex for CSS Variable
 * declaration, in the CSS files or it's AST representation.
 */
export const CSS_VAR_REGEX = /^[\s\t]*--/;
