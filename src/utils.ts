/**
 * Utility helper functions
 */

import {
  CSS3Colors,
  CSSVarRecord,
  CSS_REGEX_INITIATOR,
  JSS_REGEX_INITIATOR,
  JS_IDS,
  SupportedLanguageIds,
  VAR_KEYWORD_REVERSE,
} from "./constants";
import { CSSVarDeclarations } from "./main";
import { lighten } from "polished";
import { Range } from "vscode";

const cssVarRegex = /var\((--[\w-]*)\)/;

function getValue(value: string, cssVars?: CSSVarDeclarations[]): string {
  if (cssVars && /var\(.*?\)/.test(value)) {
    const propertyName = value.match(cssVarRegex);
    if (propertyName) {
      const cssVar = cssVars.find(
        cssVar => cssVar.property === propertyName[1]
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return getValue(cssVar?.value || "", cssVars);
    }
  } else {
    return value;
  }
  return value;
}

/**
 * This method will help convert non-conventional
 * color calues like color names `red` etc.
 * to their proper HEX values, so that VSCode
 * can show their colors in Helper Dialog.
 */
export function getColor(
  value: string,
  cssVars?: CSSVarDeclarations[]
): {
  success: boolean;
  color: string;
} {
  if (cssVars && /^var/.test(value)) {
    const propertyName = value.match(/^var\((--[\w-]*)\)/);
    if (propertyName) {
      const cssVar = cssVars.find(
        cssVar => cssVar.property === propertyName[1]
      );
      return getColor(cssVar?.value || "");
    }
  } else {
    if (
      /^#|^rgba?|^hsla?|^transparent$/.test(value) ||
      CSS3Colors.includes(value.toLowerCase())
    ) {
      return {
        success: true,
        color: lighten(0, value),
      };
    }
  }
  return {
    success: false,
    color: "",
  };
}

export const isObjectProperty = <T>(obj: T, key: any): key is keyof T =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const isObjectEmpty = (obj: Record<string, any>): boolean =>
  Object.keys(obj).filter(key => isObjectProperty(obj, key)).length === 0;

/**
 * Shallow Compare any JS POJO, to test immutability
 */
export const shallowCompare = (obj1: any, obj2: any) => {
  if (obj1 == null || obj2 == null) {
    return obj1 !== obj2;
  }
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 === "string" || obj1 instanceof String) {
    return obj1 === obj2;
  }
  if (typeof obj1 === "number" || obj1 instanceof Number) {
    return obj1 === obj2;
  }
  if (typeof obj1 === "boolean" || obj1 instanceof Boolean) {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const isEqual = obj1.length === obj2.length;
    if (isEqual) {
      return obj1.every((item, index) => item === obj2[index]);
    } else {
      return isEqual;
    }
  }
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(
      key => isObjectProperty(obj2, key) && obj1[key] === obj2[key]
    )
  );
};

/**
 * Get an Array reresentation for the
 * CSSVarDeclaration Record.
 */
export const getCSSDeclarationArray = (cssVars: CSSVarRecord) =>
  Object.keys(cssVars).reduce(
    (acc, key) => acc.concat(cssVars[key]),
    [] as CSSVarDeclarations[]
  );

export const isCSSInJS = (languageId: SupportedLanguageIds) =>
  JS_IDS.includes(languageId as any);

export const reverseFindVarKeyword = (
  input: string,
  startPos: number
): boolean => {
  for (let index = 0; index < 4; index++) {
    if (input.charAt(startPos - index - 1) !== VAR_KEYWORD_REVERSE[index]) {
      return false;
    }
  }
  return true;
};

export interface Region {
  range: Range;
  insideVar: boolean;
  suffixChar: string;
}

/**
 * Restrict Intellisense if we do not get a proper CSS Variable activator.
 * This function will return an array of regions, where CSS Variable is found.
 * If no CSS Variable value is found, an empty array will be returned, for which
 * we can ignore intellisense calls.
 *
 * @param text Should be the text from start of the line
 * @param lang supported lang, like JS/TS/CSS etc.
 * @param currentRange Current Line and Character Range where the text cursor is present.
 */
export const restrictIntellisense = (
  text: string,
  lang: SupportedLanguageIds,
  currentRange: Range
): Region[] => {
  // irrespective of JS or CSS files, `:` is the common entity
  // that is present while defining CSS Values, thus splitting it
  // into two halves will give us the value in second.
  const [property, value] = text.split(":");
  if (!value) {
    return [];
  }

  const cursorPosition = currentRange.end;
  const findRegion = (start: number, size: number): Region => {
    const range = new Range(
      cursorPosition.with(cursorPosition.line, property.length + 1 + start),
      cursorPosition.with(cursorPosition.line, property.length + start + size)
    );
    const suffixChar = value.charAt(start + size);
    const insideVar = reverseFindVarKeyword(value, start);
    return {
      range,
      suffixChar,
      insideVar,
    };
  };
  if (isCSSInJS(lang)) {
    const results = [...value.matchAll(JSS_REGEX_INITIATOR)];
    const regions = results.map(result => {
      const size = result[1].length; // Returns the matched strings length.
      const start = result.index || 0;
      return findRegion(start, size);
    });
    return regions;
  } else {
    const results = [...value.matchAll(CSS_REGEX_INITIATOR)];
    const regions = results.map(result => {
      const size = result[1].length; // Returns the matched strings length.
      const start = (result.index || 0) + 1;
      return findRegion(start, size);
    });
    return regions;
  }
};
