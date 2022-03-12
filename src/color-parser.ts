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

export const serializeColor = (color: string) => {
  const parsedColor = parseColor(color);

  if (parsedColor) {
    return serializeRgb(CONVERTERS[parsedColor.mode](parsedColor as any));
  }

  return "";
};
