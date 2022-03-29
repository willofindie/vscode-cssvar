import {
  BasicParserReturn,
  parseHsl,
  parseHex,
  parseHwb,
  parseLab,
  parseLch,
  parseNamed,
  parseRgb,
  parseTransparent,
  serializeRgb,
  convertHwbToRgb,
  convertHslToRgb,
  convertLchToLab,
  convertLabToRgb,
  LCH,
  RGB,
} from "culori/fn";

const CONVERTERS = {
  hsl: convertHslToRgb,
  hwb: convertHwbToRgb,
  lch: (color: LCH) => convertLabToRgb(convertLchToLab(color)),
  lab: convertLabToRgb,
  rgb: (color: RGB) => color,
};
const parsers = [
  parseHsl,
  parseHex,
  parseHwb,
  parseLab,
  parseLch,
  parseNamed,
  parseRgb,
  parseTransparent,
];

export const parseColor = (color: string) => {
  let parsedColor: BasicParserReturn | undefined;
  for (const parser of parsers) {
    const value = parser(color);
    if (value) {
      parsedColor = value;
    }
  }

  return parsedColor;
};

export const parseToRgb = (color: string) => {
  const parsedColor = parseColor(color);

  if (parsedColor) {
    return CONVERTERS[parsedColor.mode](parsedColor as any);
  }

  return null;
};

export const serializeColor = (
  color: string
): {
  isColor: boolean;
  color: string;
} => {
  /**
   * There's a bug in culori parser, where even a simple number string that
   * contains hex digits is considered as a hex value.
   * For e.g.: culori.formatRgb("106") is not undefined
   *
   * This regex makes sure if color starts and ends with digits, it means it's
   * a number and not a color.
   */
  if (/^\d+$/.test(color)) {
    return {
      isColor: false,
      color,
    };
  }

  const parsedColor = parseColor(color);

  if (parsedColor) {
    return {
      isColor: true,
      color: serializeRgb(CONVERTERS[parsedColor.mode](parsedColor as any)),
    };
  }

  return {
    isColor: false,
    color,
  };
};
