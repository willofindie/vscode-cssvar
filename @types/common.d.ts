declare module "culori/fn" {
  export type ColorsNamed = {
    aliceblue: number;
    antiquewhite: number;
    aqua: number;
    aquamarine: number;
    azure: number;
    beige: number;
    bisque: number;
    black: number;
    blanchedalmond: number;
    blue: number;
    blueviolet: number;
    brown: number;
    burlywood: number;
    cadetblue: number;
    chartreuse: number;
    chocolate: number;
    coral: number;
    cornflowerblue: number;
    cornsilk: number;
    crimson: number;
    cyan: number;
    darkblue: number;
    darkcyan: number;
    darkgoldenrod: number;
    darkgray: number;
    darkgreen: number;
    darkgrey: number;
    darkkhaki: number;
    darkmagenta: number;
    darkolivegreen: number;
    darkorange: number;
    darkorchid: number;
    darkred: number;
    darksalmon: number;
    darkseagreen: number;
    darkslateblue: number;
    darkslategray: number;
    darkslategrey: number;
    darkturquoise: number;
    darkviolet: number;
    deeppink: number;
    deepskyblue: number;
    dimgray: number;
    dimgrey: number;
    dodgerblue: number;
    firebrick: number;
    floralwhite: number;
    forestgreen: number;
    fuchsia: number;
    gainsboro: number;
    ghostwhite: number;
    gold: number;
    goldenrod: number;
    gray: number;
    green: number;
    greenyellow: number;
    grey: number;
    honeydew: number;
    hotpink: number;
    indianred: number;
    indigo: number;
    ivory: number;
    khaki: number;
    lavender: number;
    lavenderblush: number;
    lawngreen: number;
    lemonchiffon: number;
    lightblue: number;
    lightcoral: number;
    lightcyan: number;
    lightgoldenrodyellow: number;
    lightgray: number;
    lightgreen: number;
    lightgrey: number;
    lightpink: number;
    lightsalmon: number;
    lightseagreen: number;
    lightskyblue: number;
    lightslategray: number;
    lightslategrey: number;
    lightsteelblue: number;
    lightyellow: number;
    lime: number;
    limegreen: number;
    linen: number;
    magenta: number;
    maroon: number;
    mediumaquamarine: number;
    mediumblue: number;
    mediumorchid: number;
    mediumpurple: number;
    mediumseagreen: number;
    mediumslateblue: number;
    mediumspringgreen: number;
    mediumturquoise: number;
    mediumvioletred: number;
    midnightblue: number;
    mintcream: number;
    mistyrose: number;
    moccasin: number;
    navajowhite: number;
    navy: number;
    oldlace: number;
    olive: number;
    olivedrab: number;
    orange: number;
    orangered: number;
    orchid: number;
    palegoldenrod: number;
    palegreen: number;
    paleturquoise: number;
    palevioletred: number;
    papayawhip: number;
    peachpuff: number;
    peru: number;
    pink: number;
    plum: number;
    powderblue: number;
    purple: number;
    rebeccapurple: number;
    red: number;
    rosybrown: number;
    royalblue: number;
    saddlebrown: number;
    salmon: number;
    sandybrown: number;
    seagreen: number;
    seashell: number;
    sienna: number;
    silver: number;
    skyblue: number;
    slateblue: number;
    slategray: number;
    slategrey: number;
    snow: number;
    springgreen: number;
    steelblue: number;
    tan: number;
    teal: number;
    thistle: number;
    tomato: number;
    turquoise: number;
    violet: number;
    wheat: number;
    white: number;
    whitesmoke: number;
    yellow: number;
    yellowgreen: number;
  };
  export type Mode<T> = { mode: T };
  type Color = { alpha?: number };
  export type HSL = Color & {
    h: number | undefined;
    s: number;
    l: number;
  };
  export type HSI = Color & { h: number; s: number; i: number };
  export type HSV = Color & { h: number; s: number; v: number };
  export type HWB = Color & { h: number; w: number; b: number };
  export type RGB = Color & { r: number; g: number; b: number };
  export type LCH = Color & { l: number; c: number; h: number };
  export type LAB = Color & { l: number; a: number; b: number };
  export type JAB = Color & { j: number; a: number; b: number };
  export type XYZ = Color & {
    x: number;
    y: number;
    z: number;
  };

  export type Colors = RGB | HSL | HSV | HSI | HWB | LCH | LAB;

  export type ColorDefinition = {
    mode: string;
    channels: string[];
    parse: (string | ((color: string) => Record<string, number | string>))[];
    serialize: string;

    interpolate: any;
    toMode?: Record<
      string,
      (
        color: Record<string, number | string>
      ) => Record<string, number | string>
    >;
  };

  export const convertA98ToXyz65: () => void;
  export const convertCubehelixToRgb: () => void;
  export const convertDlchToLab65: () => void;
  export const convertHsiToRgb: (color: HSI) => RGB & Mode<"rgb">;
  export const convertHslToRgb: (color: HSL) => RGB & Mode<"rgb">;
  export const convertHsvToRgb: (color: HSV) => RGB & Mode<"rgb">;
  export const convertHwbToRgb: (color: HWB) => RGB & Mode<"rgb">;
  export const convertJabToJch: () => void;
  export const convertJabToRgb: () => void;
  export const convertJabToXyz65: () => void;
  export const convertJchToJab: () => void;
  export const convertLab65ToDlch: () => void;
  export const convertLab65ToRgb: () => void;
  export const convertLab65ToXyz65: () => void;
  export const convertLabToLch: () => void;
  export const convertLabToRgb: (color: LAB) => RGB & Mode<"rgb">;
  export const convertLabToXyz50: () => void;
  export const convertLchToLab: (color: LCH) => LAB & { mode: "lab" };
  export const convertLchuvToLuv: () => void;
  export const convertLrgbToOklab: () => void;
  export const convertLrgbToRgb: () => void;
  export const convertLuvToLchuv: () => void;
  export const convertLuvToXyz50: () => void;
  export const convertOkhslToOklab: () => void;
  export const convertOkhsvToOklab: () => void;
  export const convertOklabToLrgb: () => void;
  export const convertOklabToOkhsl: () => void;
  export const convertOklabToOkhsv: () => void;
  export const convertOklabToRgb: () => void;
  export const convertP3ToXyz65: () => void;
  export const convertProphotoToXyz50: () => void;
  export const convertRec2020ToXyz65: () => void;
  export const convertRgbToCubehelix: () => void;
  export const convertRgbToHsi: (color: RGB) => HSI & Mode<"hsi">;
  export const convertRgbToHsl: (color: RGB) => HSL & Mode<"hsl">;
  export const convertRgbToHsv: (color: RGB) => HSV & Mode<"hsv">;
  export const convertRgbToHwb: (color: RGB) => HWB & Mode<"hwb">;
  export const convertRgbToJab: (color: RGB) => JAB & Mode<"jab">;
  export const convertRgbToLab: (color: RGB) => LAB & Mode<"lab">;
  export const convertRgbToLab65: () => void;
  export const convertRgbToLrgb: () => void;
  export const convertRgbToOklab: () => void;
  export const convertRgbToXyz50: () => void;
  export const convertRgbToXyz65: () => void;
  export const convertRgbToYiq: () => void;
  export const convertXyz50ToLab: () => void;
  export const convertXyz50ToLuv: () => void;
  export const convertXyz50ToProphoto: () => void;
  export const convertXyz50ToRgb: () => void;
  export const convertXyz50ToXyz65: () => void;
  export const convertXyz65ToA98: () => void;
  export const convertXyz65ToJab: () => void;
  export const convertXyz65ToLab65: () => void;
  export const convertXyz65ToP3: () => void;
  export const convertXyz65ToRec2020: () => void;
  export const convertXyz65ToRgb: () => void;
  export const convertXyz65ToXyz50: () => void;
  export const convertYiqToRgb: () => void;
  export const converter: (
    color: string | ({ [key: string]: number } & { mode?: string })
  ) => ReturnType<typeof convertRgbToHsi>;

  /**
   * Parsers
   */
  export const parseHsl: (color: string) => HSL & Mode<"hsl">;
  export const parseLab: (color: string) => LAB & Mode<"lab">;
  export const parseNamed: (color: string) => RGB & Mode<"rgb">;
  export const parseTransparent: (color: string) => RGB & Mode<"rgb">;
  export const parseHex: (color: string) => RGB & Mode<"rgb">;
  export const parseHwb: (color: string) => HWB & Mode<"hwb">;
  export const parseLch: (color: string) => LCH & Mode<"lch">;
  export const parseRgb: (color: string) => RGB & Mode<"rgb">;
  export type BasicParsers =
    | typeof parseHsl
    | typeof parseLab
    | typeof parseNamed
    | typeof parseTransparent
    | typeof parseHex
    | typeof parseHwb
    | typeof parseLch
    | typeof parseRgb;
  export type BasicParserReturn = ReturnType<BasicParsers>;
  export const parse:
    | typeof parseHsl
    | typeof parseLab
    | typeof parseNamed
    | typeof parseTransparent
    | typeof parseHex
    | typeof parseHwb
    | typeof parseLch
    | typeof parseRgb;

  /**
   * Serializers
   */
  export const serializeHex: (color: RGB & Mode<"rgb">) => string;
  export const serializeHex8: (color: RGB & Mode<"rgb">) => string;
  export const serializeHsl: (color: HSL & Mode<"hsl">) => string;
  export const serializeRgb: (color: RGB & Partial<Mode<"rgb">>) => string;
}
